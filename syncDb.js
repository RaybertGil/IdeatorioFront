// syncDb.js
import sequelize from './config/db.js';
import Session from './models/Session.js';
import Participant from './models/Participant.js';

// Relacionar tablas
Session.hasMany(Participant, { foreignKey: 'session_id' });
Participant.belongsTo(Session, { foreignKey: 'session_id' });

// Sincronizar base de datos
sequelize
  .sync({ alter: true }) // Usa alter:true para actualizar tablas existentes sin borrar datos
  .then(() => console.log('Tablas sincronizadas con éxito.'))
  .catch((err) => console.error('Error al sincronizar las tablas:', err));
