const numerosAleatorios=(can)=>{
    let array=[];
    for (let index = 0; index < can; index++) {
        let NA=Math.floor(Math.random() * 1001);
        let index = array.findIndex((e)=> e.numero == NA);
        if(index==-1){
            array.push({numero: NA,cantidad: 1})
        }else{
            array[index]={numero: NA, cantidad: array[index].cantidad+1}
        }
    }
    return array;
    
}

process.on("message", (x)=>{
    if (x=='start'){
        process.send(numerosAleatorios(100000000));
    }else{
        process.send(numerosAleatorios(x));
    }
});