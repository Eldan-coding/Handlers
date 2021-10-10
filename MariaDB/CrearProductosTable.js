import options from './options/mariaDB.js';
import knex from 'knex';

const KNEX=knex(options);

KNEX.schema.createTableIfNotExists('productos', table=>{
    table.increments('id'),
    table.string('title'),
    table.integer('price'),
    table.string('thumbnail')
})
.then(()=>{
    console.log('tabla creada');
})
.catch(e=>{
    console.log('error', e)
})
.finally(()=>KNEX.destroy()); 
//console.log(process.cwd());