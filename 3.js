function generatePattern(size) {
    let pattern = '';
    
    // Pastikan ukuran adalah ganjil
    if (size % 2 === 0) {
      return "Ukuran harus ganjil!";
    }
    
    const middle = Math.floor(size / 2); // Baris dan kolom middle
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (i === 0 || i === size - 1) {
          // Baris pertama dan terakhir: Pola bergantian antara '*' dan '#'
          pattern += (j % 2 === 0) ? '* ' : '# ';
        } else if (i === 1 || i === size - 2) {
          // Baris kedua dan satu sebelum terakhir: Pola '# # * # #'
          pattern += (j === 0 || j === size - 1) ? '# ' : (j === middle) ? '* ' : '# ';
        } else if (i === middle) {
          // Baris middle: Pola '* * # * *'
          pattern += (j === 0 || j === size - 1) ? '* ' : (j === middle) ? '# ' : '* ';
        } else {
          // Baris lainnya: Pola '# # * # #'
          pattern += (j === middle) ? '* ' : '# ';
        }
      }
      pattern += '\n'; // Pindah ke baris berikutnya
    }
    
    return pattern;
  }
  
  // Contoh penggunaan
  console.log(generatePattern(7));
  