const sequelize = require('../config/database');

sequelize
  .authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log('Error connecting to database:', err));

// Sync the models (optional; make sure not to drop data in production)
sequelize
  .sync({ alter: true })
  .then(async () => {
    console.log('Database synchronized with models');
    // Ensure email_group_id allows NULL for SINGLE send campaigns
    try {
      await sequelize.query('ALTER TABLE "EmailCampaign" ALTER COLUMN "email_group_id" DROP NOT NULL;');
      console.log('email_group_id constraint updated to allow NULL');
    } catch (err) {
      // Column may already allow NULL — safe to ignore
      console.log('email_group_id constraint already allows NULL or table does not exist yet');
    }
  })
  .catch((err) => console.error('Error synchronizing database:', err));
