// function takes 3 parameters, array, array's lowest index, array's highest index
function partition(array, low, high) {
    i = low
    j = high
    // pivot value is set to array's lowest index
    pivot = array[low]

    // once i >= j, pivot is ready to be switched to the index of j
    while (i < j) {
        // iterates forwards through array, starting from previous value of i
        for (i; i < high; i++) {
            // once array value at index i is greater than pivot value, we have our value of i and break the loop
            if (array[i] > pivot) {
                break
            }
        }
    
        // iterates backwards through array, starting from previous value of j
        for (j; j >= low; j--) {
            // once array value at index i is less than or equal to pivot value, we have our value of j and break the loop
            if (array[j] <= pivot) {
                break
            }
        }

        // if i is less than or equal to j, switch pivot value with array value at j
        if (i >= j) {
            temp = pivot
            array[low] = array[j]
            array[j] = temp
        }
        // otherwise, switch value at i with value at j... by doing this, when we are ready to switch our pivot, the values on the sides of our pivot will all be either greater or less than it
        else {
            temp = array[i]
            array[i] = array[j]
            array[j] = temp
        }
    }
    // returns vlaue of j, to be used in quickSort function
    return j
}

// takes same 3 parameters, and will recursively break the list down into smaller components, placing sorted values of j with each call of the partition function
function quickSort(array, low, high) {
    // if there is still more than one element in the list
    if (low < high) {
        j = partition(array, low, high)
        quickSort(array, low, j-1)
        quickSort(array, j+1, high)
    }
}
/*
array = [3, 4, 1, 7, 5, 9, 2]
quickSort(array, 0, array.length - 1)
console.log(array)
*/
/*
array = [1, 2, 3, 4, 5, 6]
low = 0
high = array.length - 1
j = 3;
console.log(array.slice(low, j + 1))
console.log(array.slice(j+1, high + 1))
*/

elementArray = [1, 2, 3, 4, 5, 6, 7]

function test() {
    sorted = false
    for (i in elementArray) {
        if (elementArray[i] > elementArray[Number(i) + 1]) {
            break
        }
        if (i == elementArray.length - 2) {
            if (elementArray[i] <= elementArray[Number(i) + 1]) {
                sorted = true
            }
        }
    }
    console.log(sorted)
}

var fruits = ["Banana", "Orange", "Apple", "Mango", "Kiwi"];
fruits.splice(2, 2);
console.log(fruits)