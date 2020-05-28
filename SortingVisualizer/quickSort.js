// --------------------------------- setup of canvas -----------------------------------------

const canvas = document.querySelector('canvas')
canvas.width = innerWidth * 0.9
canvas.height = 220
c = canvas.getContext('2d')

// -------------------------------------------------------------------------------------------

// --------------------------------- Box class------------------------------------------------

// dimensions for list indices that will be visualized on the canvas
class Box {
  constructor(x, y, width, height, value, color) {
    this.x = x // x coordinate of upper left corner
    this.y = y // y coordinate of upper left croner
    this.width = width  // width of index box
    this.height = height // height of index box
    this.value = value  // value stored in index box
    this.color = color // color of box
  }

  draw() { // method that draws boxes with a value stored inside
    c.beginPath()
    c.rect(this.x, this.y, this.width, this.height)
    c.fillStyle = this.color
    c.fill()
    c.stroke()
    c.closePath()
    c.beginPath()
    c.font = "11px Arial"
    c.fillStyle = "black"
    if (this.value == "i" || this.value == "j") {
      c.fillText(this.value, this.x + 0.46 * this.width, this.y + 0.6 * this.height)
    }
    else if (this.value < 10) {
      c.fillText(this.value, this.x + 0.39 * this.width, this.y + 0.6 * this.height)
    }
    else if (10 <= this.value && this.value < 100) {
      c.fillText(this.value, this.x + 0.26 * this.width, this.y + 0.6 * this.height)
    }
    else {
      c.fillText(this.value, this.x + 0.125 * this.width, this.y + 0.6 * this.height)
    }
    c.fill()
    c.closePath()
  }

  updateX(dx, direction) { // updates the x value of a box for next screen refresh by dx pixels
    if (direction == "left") {
      this.x -= dx
    }
    if (direction == "right") {
      this.x += dx
    }
  }

  updateY(dy, direction) { // updates the x value of a box for next screen refresh by dy pixels
    if (direction == "up") {
      this.y -= dy
    }
    if (direction == "down") {
      this.y += dy
    }
  }
}

// -------------------------------------------------------------------------------------------

// ---------------------------- functions to be used in main program -------------------------

// Helper function: returns a random number in range of two given numbers
function randomIntFromRange(num1, num2) {
  distance = num2 + 1 - num1
  randomDistanceBetween = Math.random() * distance
  number = Math.floor(num1 + randomDistanceBetween)
  return number
}

// Funtion that initializes the visual elements and what will be working behind the scenes
function initialize() {
  // width height, and color of index boxes
  elementWidth = 25
  elementHeight = 50
  elementColor = "#fff"
  sortedColor = "#6089f7"

  elementArray = [] // list for our number elements

  // element generator creates and adds box elements to list
  yValue = canvas.height / 2 // y value location of boxes on canvas
  x0Value = elementWidth // x value location of first box on canvas
  sortedList = []
  i = 0
  while (i * elementWidth < canvas.width - (3 * elementWidth)) {
    xValue = x0Value + elementWidth * i // so boxes will be placed immediately next to each other
    listElement = new Box(xValue, yValue, elementWidth, elementHeight, randomIntFromRange(1, 999), elementColor)
    elementArray.push(listElement)
    sortedList.push("NS")
    i += 1
  }

  ijList = []

  // i and j boxes are created
  ijList.push(new Box(x0Value, yValue + elementHeight, elementWidth, elementHeight, "i", elementColor))
  ijList.push(new Box(elementArray[elementArray.length - 1].x, yValue + elementHeight, elementWidth, elementHeight, "j", elementColor))

  arrayStack = [elementArray] // sub-arrays will be placed in here to be sorted in the future
  ijValueArray = [0, elementArray.length - 1] // contains current positions of i and j, index 0 is i, index 1 is j
  referenceNumber = 0 // final refresh number of whatever the previous state was, needed to determine when the next state finishes
  number = 0 // current number of screen refreshes, used to determine when current state ends
  state = "calculatingDistance" // first state that the program finds itself in
  for (i in elementArray) {
    elementArray[i].draw()
  }
  for (i in ijList) {
    ijList[i].draw()
  }
  firstPress = true
}

// The next three functions use two variables in their animation, oldNumber and number. Since the animate() function increments number with each screen refresh, oldNumber is needed as a reference for the total count of number from every previous state in the program.

function placeIAndJ(array, speedFactor, oldNumber, number) {
  initialIValue = ijValueArray[0] // initial i and j values are taken as variables
  initialJValue = ijValueArray[1]
  if (state == "calculatingDistance") { // program begins in this state... distances to appropriate i and j indices are calculated
    for (i = initialIValue; i < initialIValue + array.length; i++) {
      if (elementArray[i].value > array[0].value) { // distance to i index is found (where i index value > pivot value)
        iDistance = i - initialIValue
        break
      }
      if (i == initialIValue + array.length - 1) { // for case where i index is on last array element
        iDistance = array.length - 1
      }
    }
    for (j = initialJValue; j >= initialJValue - array.length + 1; j--) {
      if (elementArray[j].value <= array[0].value) { // distance to j index is found (where j index value <= pivot value)
        jDistance = initialJValue - j
        break
      }
    }
    state = "movingIAndJ" // the behind the scenes work is done for this function, now the animation state is entered which uses the distances calculated above
  }
  if (oldNumber == 0) { // for the first animation state of the program
    // rise and runNumbers in this program are calculated by the number of screen refreshes it takes for the element to get to where it needs to be at the "speed" it is travelling at (pixels moved per screen refresh) 
    iRunNumber = oldNumber + (elementWidth * iDistance / speedFactor)
    jRunNumber = oldNumber + (elementWidth * jDistance / speedFactor)
  }
  else { // all other states of the program must account for number's (the variable) incrementation with each call to animate() later in the program
    iRunNumber = oldNumber + (elementWidth * iDistance / speedFactor) + 1
    jRunNumber = oldNumber + (elementWidth * jDistance / speedFactor) + 1
  }
  if (iDistance >= jDistance) { // the end of the state will be signaled by when i or j finishes travelling (whichever one has to travel farther)
    endNumber = iRunNumber
  }
  else {
    endNumber = jRunNumber
  }
  if (number < iRunNumber) {
    ijList[0].updateX(speedFactor, "right") // i moves right until it finds its position
  }
  if (number < jRunNumber) {
    ijList[1].updateX(speedFactor, "left") // j moves left until it fnds its position
  }
  // i and j values are incremented based upon their direction every time they pass an element
  if (ijList[0].x % elementWidth == 0 && number < iRunNumber) {
    ijValueArray[0] += 1
  }
  if (ijList[1].x % elementWidth == 0 && number < jRunNumber) {
    ijValueArray[1] -= 1
  }
  if (number == endNumber) {
    referenceNumber = number // reference number takes on value of current refresh number
    if (ijValueArray[0] < ijValueArray[1]) {
      state = "switching" // state to switch i and j elements
    }
    else {
      state = "sortingSwitch" // state to switch j and pivot elements
    }
  }
}

function switchElements(array, speedFactor, oldNumber, number) {
  // left and right elements are selected based upon state
  if (state == "switching") {
    leftElement = elementArray[ijValueArray[0]]
    rightElement = elementArray[ijValueArray[1]]
  }
  if (state == "sortingSwitch") {
    leftElement = array[0]
    rightElement = elementArray[ijValueArray[1]]
  }
  distance = elementArray.indexOf(rightElement) - elementArray.indexOf(leftElement) // number of elements each element must travel across
  riseNumber = oldNumber + (elementHeight / speedFactor) + 1 // number that signals the end of the rising phase of the animation
  runNumber = riseNumber + (elementWidth * distance / speedFactor) + 1 // number that signals the end of the running phase of the animation
  dropNumber = runNumber + (elementHeight / speedFactor) + 1 // number that signals the end of the dropping phase of the animation
  if (distance == 0) { // when no switching animation is needed
    riseNumber = oldNumber + 1
    runNumber = oldNumber + 1
    dropNumber = oldNumber + 1
  }
  if (number < riseNumber) { // rising phase of the switching animation
    leftElement.updateY(speedFactor, "up")
    rightElement.updateY(2 * speedFactor, "up") // right element rises above left
  }
  if (number > riseNumber && number < runNumber) { // running phase of the switching animation
    leftElement.updateX(speedFactor, "right")
    rightElement.updateX(speedFactor, "left")
  }
  if (number > runNumber && number < dropNumber) { // dropping phase of the animation
    leftElement.updateY(speedFactor, "down")
    rightElement.updateY(2 * speedFactor, "down") // because right was above left
  }
  if (number == dropNumber) { // once animation is finished, the element values are switched behind the scenes
    temp1 = rightElement
    temp2 = leftElement
    leftElement = temp1 // leftElement variable is changed to new left element
    rightElement = temp2 // rightElement variable is changed to new right element
    elementArray[elementArray.indexOf(temp1)] = temp2
    elementArray[elementArray.indexOf(temp2)] = temp1
    array[array.indexOf(temp1)] = temp2
    array[array.indexOf(temp2)] = temp1
    referenceNumber = number // reference number takes on value of current refresh number
    if (state == "switching") {
      state = "calculatingDistance" // goes back to find index of next i and j values
    }
    else {
      if (array.length == 2) { // both elements are sorted and no splicing needs to occur
        array[0].color = sortedColor // array[0] and array[1] are used here because rightElement could equal leftElement
        sortedList[elementArray.indexOf(array[0])] = "S"
        array[1].color = sortedColor
        sortedList[elementArray.indexOf(array[1])] = "S"
        arrayStack.splice(0, 1)
      }
      else {
        arrayDuplicate = [...array] // duplicate array that will be mutated to get sub-array
        if (array.indexOf(rightElement) == 0) { // if the leftmost element gets sorted by not moving
          sortedList[elementArray.indexOf(leftElement)] = "S"
          rightElement.color = sortedColor
          arrayStack[0] = arrayDuplicate.splice(1, arrayDuplicate.length - 1)
        }
        else if (array.indexOf(rightElement) == 1 && array.indexOf(rightElement) == array.length - 2) {
          sortedList[elementArray.indexOf(rightElement)] = "S"
          rightElement.color = sortedColor
          sortedList[elementArray.indexOf(rightElement) - 1] = "S"
          elementArray[elementArray.indexOf(rightElement) - 1].color = sortedColor
          sortedList[elementArray.indexOf(rightElement) + 1] = "S"
          elementArray[elementArray.indexOf(rightElement) + 1].color = sortedColor
          arrayStack.splice(0, 1)
        }
        else if (array.indexOf(rightElement) == 1) { // if the element to the right of the leftmost element gets sorted
          sortedList[elementArray.indexOf(rightElement)] = "S"
          rightElement.color = sortedColor
          sortedList[elementArray.indexOf(rightElement) - 1] = "S"
          elementArray[elementArray.indexOf(rightElement) - 1].color = sortedColor
          arrayStack[0] = arrayDuplicate.splice(2, arrayDuplicate.length - 2)
        }
        else if (array.indexOf(rightElement) == array.length - 1) { // if the rightmost element gets sorted
          sortedList[elementArray.indexOf(rightElement)] = "S"
          rightElement.color = sortedColor
          arrayStack[0] = arrayDuplicate.splice(0, arrayDuplicate.length - 1)
        }
        else if (array.indexOf(rightElement) == array.length - 2) { // if the element to the left of the rightmost element gets sorted
          sortedList[elementArray.indexOf(rightElement)] = "S"
          rightElement.color = sortedColor
          sortedList[elementArray.indexOf(rightElement) + 1] = "S"
          elementArray[elementArray.indexOf(rightElement) + 1].color = sortedColor
          arrayStack[0] = arrayDuplicate.splice(0, arrayDuplicate.length - 2)
        }
        else { // if a middle element gets sorted and breaks into two sublists
          sortedList[elementArray.indexOf(rightElement)] = "S"
          rightElement.color = sortedColor
          leftList = arrayDuplicate.splice(0, arrayDuplicate.indexOf(elementArray[ijValueArray[1]]))
          rightList = arrayDuplicate.splice(1, arrayDuplicate.length)
          arrayStack[0] = leftList
          arrayStack.splice(1, 0, rightList)
        }
      }
      state = "resetIAndJ" // once this state finishes, i and j must reset themselves for the new array they will be working on
    }
  }
}

function returnIAndJ(array, speedFactor, oldNumber, number) {
  if (number == oldNumber + 1) { // conditional is applied so distances are not continually calculated, which will mess up the program
    iDistance = elementArray.indexOf(array[0]) - ijValueArray[0]
    jDistance = elementArray.indexOf(array[array.length - 1]) - ijValueArray[1]
  }
  if (iDistance && jDistance < 0) { // if i and j must travel left
    iRunNumber = oldNumber + (elementWidth * (iDistance * -1) / speedFactor) + 1
    jRunNumber = oldNumber + (elementWidth * (jDistance * -1) / speedFactor) + 1
  }
  else { // if i and j must travel right
    iRunNumber = oldNumber + (elementWidth * iDistance / speedFactor) + 1
    jRunNumber = oldNumber + (elementWidth * jDistance / speedFactor) + 1
  }
  if (Math.abs(iDistance) >= Math.abs(jDistance)) { // end of state is triggered by whichever block has to travel farther
    endNumber = iRunNumber
  }
  else {
    endNumber = jRunNumber
  }
  if (iDistance < 0 && jDistance < 0) { // when i and j must travel left
    if (number < iRunNumber) {
      ijList[0].updateX(speedFactor, "left")
    }
    if (number < jRunNumber) {
      ijList[1].updateX(speedFactor, "left")
    }
    if (number % (elementWidth / speedFactor) == 0 && number < iRunNumber) { // i and j values are incremented whenever they pass an element
      ijValueArray[0] -= 1
    }
    if (number % (elementWidth / speedFactor) == 0 && number < jRunNumber) {
      ijValueArray[1] -= 1
    }
  }
  else { // when i and j must travel right
    if (number < iRunNumber) {
      ijList[0].updateX(speedFactor, "right")
    }
    if (number < jRunNumber) {
      ijList[1].updateX(speedFactor, "right")
    }
    if (number % (elementWidth / speedFactor) == 0 && number < iRunNumber) { // i and j values are incremented whenever they pass an element
      ijValueArray[0] += 1
    }
    if (number % (elementWidth / speedFactor) == 0 && number < jRunNumber) {
      ijValueArray[1] += 1
    }
  }
  if (number == endNumber) {
    referenceNumber = number // reference number takes on value of current refresh number
    state = "calculatingDistance" // now ready to back to the first state, with the only difference being that the list the program is working with is smaller now
  }
}

function partition(array, oldNumber, number, speedFactor) { // implementation of three above functions
  whatsHappening = document.getElementById("whats_happening") // used to display on window what is currently happening in the program
  speedList = [3.125, 6.25, 12.5, 25] // speeeds that are fractions of elementWidth and elementHeight (in pixels)
  speedButtons = document.getElementsByName("speed_button") // used to generate an error message on the window
  array[0].color = "#E0B0FF"
  for (i in speedButtons) {
    if (speedButtons[i].checked) {
      if (speed != speedList[i]) { // tells user to change speed after a reset, if speed changed in the middle of the animation it would fail
        errorMessageBox = document.getElementById("error_message2")
        errorMessageBox.innerHTML = "<strong>Reset, then change speed.</strong>"
      }
    }
  }
  if (state == "movingIAndJ" || state == "calculatingDistance") {
    whatsHappening.innerHTML = "Moving i and j" // first display message
    placeIAndJ(array, speedFactor, oldNumber, number)
  }
  else if (state == "switching" || state == "sortingSwitch") {
    if (state == "switching") {
      whatsHappening.innerHTML = "Switching elements" // second display message
    }
    else {
      whatsHappening.innerHTML = "Sorting" // third display message
    }
    switchElements(array, speedFactor, oldNumber, number)
  }
  else if (state == "resetIAndJ") {
    whatsHappening.innerHTML = "Resetting i and j" // fourth display message
    returnIAndJ(array, speedFactor, oldNumber, number)
  }
}

// -------------------------------------------------------------------------------------------

function getSpeed() { // used in main(), determines which speed button is selected on window
  let speed
  speedList = [3.125, 6.25, 12.5, 25]
  speedButtons = document.getElementsByName("speed_button")
  for (i in speedButtons) {
    if (speedButtons[i].checked) {
      speed = speedList[i]
    }
  }
  return speed
}

function main() { // this function is somewhat oddly designed, but it is to counter potential bugs that can occur with the canvas
  console.log(isBeginning)
  errorMessageBox = document.getElementById("error_message1")
  if (isBeginning) { // if this is the first click of SORT! button
    speed = getSpeed()
    if (speed == undefined) { // error message displays when a sorting speed has not been chosen
      errorMessageBox.innerHTML = "<strong>Choose a sorting speed.</strong>"
      return
    }
    else {
      errorMessageBox.innerHTML = "" // clears error message
    }
    doAnim = true
    myReq = animate()
    isBeginning = false
    firstPress = false
  }
  else {
    if (firstPress) { // designed to handle cases where SORT! button has already been pressed
      speed = getSpeed()
      if (speed == undefined) {
        errorMessageBox.innerHTML = "<strong>Choose a sorting speed.</strong>"
        return
      }
      else {
        errorMessageBox.innerHTML = ""
        doAnim = !doAnim // starts animation up
        firstPress = false
      }
    }
  }
}

function pause() { // pauses and resumes animation
  if (!firstPress) {
    doAnim = !doAnim
  }
}

function reset() { // places a clean, newly randomized list on canvas
  c.clearRect(0, 0, innerWidth, innerHeight)
  initialize()
  doAnim = false
  firstPress = true
  whatsHappening = document.getElementById("whats_happening")
  whatsHappening.innerHTML = ""
  errorMessageBox = document.getElementById("error_message2")
  errorMessageBox.innerHTML = ""
}

function animate() { // refreshes and draws canvas
  requestAnimationFrame(animate)
  if (!doAnim) { // halts animation
    return
  }
  c.clearRect(0, 0, innerWidth, innerHeight)
  for (i in elementArray) {
    elementArray[i].draw()
  }
  for (i in ijList) {
    ijList[i].draw()
  }
  for (i in sortedList) {
    if (sortedList[i] != "S") {
      break
    }
    if (i == sortedList.length - 1) { // if array is sorted, break the animation
      cancelAnimationFrame(myReq)
      whatsHappening.innerHTML = "Done!" // fifth display message
      return
    }
  }
  partition(arrayStack[0], referenceNumber, number, speed)
  number += 1
}

isBeginning = true // used in main() that is called when SORT! button is pressed
initialize()