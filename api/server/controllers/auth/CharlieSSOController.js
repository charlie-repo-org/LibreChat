const { logger } = require('@librechat/data-schemas');
const { validateCharlieSSOPayload } = require('@librechat/api');
const { setAuthTokens } = require('~/server/services/AuthService');
const { findUser, createUser, updateUser, getUserById } = require('~/models');

const charlieSSOController = async (req, res) => {
  try {
    const validation = validateCharlieSSOPayload(req.body);
    if (!validation.valid || !validation.email) {
      return res.status(400).json({ message: validation.error || 'Invalid Charlie SSO payload' });
    }

    const { email, name } = validation;
    let user = await findUser({ email });

    if (!user) {
      const username = name
        ? name.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30)
        : email.split('@')[0];

      const created = await createUser(
        {
          email,
          name,
          username,
          emailVerified: true,
          provider: 'charlie',
        },
        undefined,
        false,
        true,
      );
      user = created;
    } else if (name && user.name !== name) {
      await updateUser(user._id, { name });
      user.name = name;
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = await setAuthTokens(userId, res, null, req);

    const safeUser = await getUserById(userId, '-password -__v -totpSecret -backupCodes');
    if (safeUser) {
      safeUser.id = userId;
    }

    return res.status(200).json({ token, user: safeUser || user });
  } catch (err) {
    logger.error('[charlieSSOController]', err);
    return res.status(500).json({ message: 'Failed to authenticate with Charlie SSO' });
  }
};

module.exports = {
  charlieSSOController,
};
