import optionsSQLlite from './options/SQLite3.js';
import knex from 'knex';

const KNEX=knex(optionsSQLlite);

KNEX.schema.createTableIfNotExists('mensajes', table=>{
    table.string('correo'),
    table.string('fecha'),
    table.string('mensaje')
})
.then(()=>{
    console.log('tabla Mensajes creada');
})
.catch(e=>{
    console.log('error', e)
})
.finally(()=>KNEX.destroy()); 