/**
 * Connections
 * (sails.config.connections)
 *
 * `Connections` are like "saved settings" for your adapters.  What's the difference between
 * a connection and an adapter, you might ask?  An adapter (e.g. `sails-mysql`) is generic--
 * it needs some additional information to work (e.g. your database host, password, user, etc.)
 * A `connection` is that additional information.
 *
 * Each model must have a `connection` property (a string) which is references the name of one
 * of these connections.  If it doesn't, the default `connection` configured in `config/models.js`
 * will be applied.  Of course, a connection can (and usually is) shared by multiple models.
 * .
 * Note: If you're using version control, you should put your passwords/api keys
 * in `config/local.js`, environment variables, or use another strategy.
 * (this is to prevent you inadvertently sensitive credentials up to your repository.)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.connections.html
 */

/**
 * Get the database configuration from /data/db_config.yaml
 * The database configuration is kept there so that 
 * the web server and the database munging/loading configurations
 * stay in sync.
 */ 
var dbConfigPath = 'data/db_config.yaml'
var db_config = require('yamljs').load('./data/db_config.yml');

db_config.db_host = process.env.DB_SERVER_HOSTNAME || db_config.db_host

module.exports.connections = {
    bds_establishment: {
      adapter: 'sails-postgresql',
      host: db_config.db_host,
      user: db_config.db_user.user,
      password: db_config.db_user.password,
      database: 'bds_establishment'
    },
    bds_firm: {
      adapter: 'sails-postgresql',
      host: db_config.db_host,
      user: db_config.db_user.user,
      password: db_config.db_user.password,
      database: 'bds_firm'
    }
};
