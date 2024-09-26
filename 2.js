function bubbleSort(arr){
    let n= arr.length;
    let ganti;
  
    do{
      ganti = false;
  
  
      for (let i = 0; i < n -1; i++){
        if(arr[i] > arr[i + 1]){
          let tukar = arr[i]
          arr[i]=arr[i+1];
          arr[i+1]= tukar;
  
          ganti = true
        }
      }
  }while (ganti)
  
    return arr;
  }
  
  let array = [20, 12, 35, 11, 17, 9, 58, 23, 69, 21]
  console.log("Array sebelum diurutkan:", array)
  let sortedArray = bubbleSort(array)
  console.log("Array setelah diurutkan:", sortedArray)