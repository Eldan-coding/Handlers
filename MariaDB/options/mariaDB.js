const options = {
    client: 'mysql',
    connection: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'ecommercedb'
    }
}

console.log('Estableciendo conexión a la base de datos...');

export default options;