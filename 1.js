function hitungBarang(kualitas,quantity){
    let harga, potongan = 0, totalHarga;

    switch (kualitas){
        case 'A':
            harga = 4550;
            totalHarga = harga * quantity;
            if (quantity>13){
                potongan = 231 * quantity;
            }
    break;
            
        case 'B':
            harga = 5330
            totalHarga = harga * quantity;
            if(quantity>7){
                potongan = totalHarga * 0.23;
            }
    break;
        case 'C':
            harga = 8653 
            totalHarga= harga*quantity;

            break;

            default:
            return "Kualitas barang tidak valid.";

    }



    let totalBayar = totalHarga - potongan;
    
    return `- Total Harga Barang = ${totalHarga}\n  -Potongan = ${potongan} \n -Total yang Harus Dibayar = ${totalBayar} `
    
}

console.log(hitungBarang('D',14));

