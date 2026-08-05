const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const uaePassConfig = require('../config/uaePass');
const { generateToken } = require('../middleware/auth');

const pendingStates = new Map();

const cleanupExpiredStates = () => {
  const now = Date.now();
  for (const [state, data] of pendingStates.entries()) {
    if (now - data.createdAt > 600000) {
      pendingStates.delete(state);
    }
  }
};

exports.initiateLogin = (req, res) => {
  cleanupExpiredStates();

  if (!uaePassConfig.clientId) {
    return res.status(500).json({
      success: false,
      message: 'UAE PASS is not configured. Set UAE_PASS_CLIENT_ID and UAE_PASS_CLIENT_SECRET in .env',
    });
  }

  const state = uuidv4();
  pendingStates.set(state, { createdAt: Date.now() });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: uaePassConfig.clientId,
    redirect_uri: uaePassConfig.redirectUri,
    scope: uaePassConfig.scope,
    state,
    acr_values: uaePassConfig.acrValues,
  });

  const authUrl = `${uaePassConfig.authUrl}?${params.toString()}`;

  res.json({ success: true, authUrl });
};

exports.handleCallback = async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(error_description || error)}`
      );
    }

    if (!code || !state) {
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=Missing authorization code`);
    }

    if (!pendingStates.has(state)) {
      return res.redirect(`${process.env.CLIENT_URL}/signin?error=Invalid or expired state`);
    }
    pendingStates.delete(state);

    const tokenResponse = await fetch(uaePassConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${uaePassConfig.clientId}:${uaePassConfig.clientSecret}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        redirect_uri: uaePassConfig.redirectUri,
        code,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('UAE PASS token error:', tokenData);
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent(
          tokenData.error_description || 'Failed to obtain access token'
        )}`
      );
    }

    const userInfoResponse = await fetch(uaePassConfig.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    if (!userInfoResponse.ok) {
      console.error('UAE PASS userinfo error:', userInfo);
      return res.redirect(
        `${process.env.CLIENT_URL}/signin?error=${encodeURIComponent('Failed to fetch user information')}`
      );
    }

    const uaePassSub = userInfo.sub || userInfo.uuid;
    const email = userInfo.email || userInfo.mail;
    const emiratesId = userInfo.idn || userInfo.emiratesId;
    const firstName = userInfo.firstnameEN || userInfo.firstName || userInfo.given_name;
    const lastName = userInfo.lastnameEN || userInfo.lastName || userInfo.family_name;
    const phone = userInfo.mobile || userInfo.phone;

    let user = await User.findOne({ uaePassSub: uaePassSub });

    if (!user && email) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.uaePassSub = uaePassSub;
        user.uaePassId = uaePassSub;
        user.authProvider = 'uaepass';
        user.uaePassProfile = userInfo;
        if (emiratesId) user.emiratesId = emiratesId;
        await user.save();
      }
    }

    if (!user) {
      user = await User.create({
        email: email || `uaepass_${uaePassSub}@uaepass.local`,
        firstName,
        lastName,
        phone,
        emiratesId,
        uaePassSub,
        uaePassId: uaePassSub,
        authProvider: 'uaepass',
        uaePassProfile: userInfo,
        isVerified: true,
      });
    } else {
      user.uaePassProfile = userInfo;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (emiratesId) user.emiratesId = emiratesId;
      await user.save();
    }

    const token = generateToken(user._id);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('UAE PASS callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/signin?error=UAE PASS authentication failed`);
  }
};

exports.logout = (req, res) => {
  const params = new URLSearchParams({
    redirect_uri: process.env.CLIENT_URL,
  });
  const logoutUrl = `${uaePassConfig.logoutUrl}?${params.toString()}`;
  res.json({ success: true, logoutUrl });
};
