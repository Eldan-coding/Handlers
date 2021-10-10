const optionsSQLlite = {
    client: 'sqlite3',
    connection: {  filename: 'SQLite/DB/mensajes.sqlite' },
    useNullAsDefault: true
}

console.log('Estableciendo conexión a la base de datos SQLite3...');

export default optionsSQLlite;