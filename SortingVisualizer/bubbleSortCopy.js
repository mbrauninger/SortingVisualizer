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
    transitionColor ="#E0B0FF"

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
    ijList.push(new Box(2 * x0Value, yValue + elementHeight, elementWidth, elementHeight, "j", elementColor))

    arrayStack = [elementArray] // sub-arrays will be placed in here to be sorted in the future
    ijValueArray = [0, 1] // contains current positions of i and j, index 0 is i, index 1 is j
    referenceNumber = 0 // final refresh number of whatever the previous state was, needed to determine when the next state finishes
    number = 0 // current number of screen refreshes, used to determine when current state ends
    state = "calculatingDistance" // first state that the program finds itself in
    for (i in elementArray) {
        elementArray[i].draw()
    }
    for (i in ijList) {
        ijList[i].draw()
    }
    sorted = false
    firstPress = true
}

function moveIAndJ(speedFactor, oldNumber, number) {
    initialIValue = ijValueArray[0] // initial i and j values are taken as variables
    initialJValue = ijValueArray[1]
    if (state == "calculatingDistance") {
        distance = 0
        while (true) {
            if (initialJValue + distance == elementArray.length - 1) {
                break
            }
            if (elementArray[initialIValue + distance].value <= elementArray[initialJValue + distance].value) {
                distance += 1
            }
            else {
                break
            }
            for (i in elementArray) {
                if (elementArray[i].value > elementArray[Number(i) + 1].value) {
                    break
                }
                if (i == elementArray.length - 2) {
                    if (elementArray[i].value <= elementArray[Number(i) + 1].value) {
                        sorted = true
                        return
                    }
                }
            }
        }
        state = "movingIAndJ"
    }
    if (state == "movingIAndJ") {
        if (oldNumber == 0) { // for the first animation state of the program
            // rise and runNumbers in this program are calculated by the number of screen refreshes it takes for the element to get to where it needs to be at the "speed" it is travelling at (pixels moved per screen refresh) 
            runNumber = oldNumber + (elementWidth * distance / speedFactor)
        }
        else { // all other states of the program must account for number's (the variable) incrementation with each call to animate() later in the program
            runNumber = oldNumber + (elementWidth * distance / speedFactor) + 1
        }
        // rise and runNumbers in this program are calculated by the number of screen refreshes it takes for the element to get to where it needs to be at the "speed" it is travelling at (pixels moved per screen refresh)
        if (number < runNumber) {
            ijList[0].updateX(speedFactor, "right") // i moves right until it finds its position
            ijList[1].updateX(speedFactor, "right") // j moves left until it fnds its position
        }
        // i and j values are incremented based upon their direction every time they pass an element
        if (ijList[0].x % elementWidth == 0 && number < runNumber) {
            ijValueArray[0] += 1
            ijValueArray[1] += 1
        }
        if (number == runNumber) {
            referenceNumber = number // reference number takes on value of current refresh number
            state = "switching"
        }
    }
}

function switchElements(speedFactor, oldNumber, number) {
    leftElement = elementArray[ijValueArray[0]]
    leftElement.color = transitionColor
    rightElement = elementArray[ijValueArray[1]]
    distance = elementArray.indexOf(rightElement) - elementArray.indexOf(leftElement) // number of elements each element must travel across
    riseNumber = oldNumber + (elementHeight / speedFactor) + 1 // number that signals the end of the rising phase of the animation
    runNumber = riseNumber + (elementWidth * distance / speedFactor) + 1 // number that signals the end of the running phase of the animation
    dropNumber = runNumber + (elementHeight / speedFactor) + 1 // number that signals the end of the dropping phase of the animation
    if (leftElement.value <= rightElement.value) { // when no switching animation is needed
      riseNumber = oldNumber + 1
      runNumber = oldNumber + 1
      dropNumber = oldNumber + 1
      state = "resetIAndJ"
      return
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
        rightElement.color = "#fff"
        for (i = ijValueArray[0]; i < elementArray.length; i++) {
            if (elementArray[i].value > elementArray[Number(i) + 1].value) {
                break
            }
            if (i == elementArray.length - 2) {
                if (elementArray[i].value <= elementArray[Number(i) + 1].value) {
                    for (i = ijValueArray[1]; i < elementArray.length; i++) {
                        elementArray[i].color = sortedColor
                    }
                    state = "resetIAndJ"
                    return
                }
            }
        }
        referenceNumber = number // reference number takes on value of current refresh number
        state = "calculatingDistance" // goes back to find index of next i and j values
    }
}

function returnIAndJ() {
    ijValueArray[0] = 0
    ijValueArray[1] = 1
    ijList[0].x = x0Value
    ijList[1].x = 2 * x0Value
    referenceNumber = number
    state = "calculatingDistance"
}

function partition(oldNumber, number, speedFactor) { // implementation of three above functions
    whatsHappening = document.getElementById("whats_happening") // used to display on window what is currently happening in the program
    speedList = [3.125, 6.25, 12.5, 25] // speeeds that are fractions of elementWidth and elementHeight (in pixels)
    speedButtons = document.getElementsByName("speed_button") // used to generate an error message on the window
    for (i in speedButtons) {
        if (speedButtons[i].checked) {
            if (speed != speedList[i]) { // tells user to change speed after a reset, if speed changed in the middle of the animation it would fail
                errorMessageBox = document.getElementById("error_message2")
                errorMessageBox.innerHTML = "<strong>Reset, then change speed.</strong>"
            }
        }
    }
    if (state == "calculatingDistance" || state == "movingIAndJ") {
        whatsHappening.innerHTML = "Moving i and j" // first display message
        moveIAndJ(speedFactor, oldNumber, number)
    }
    else if (state == "switching" && ijValueArray[1]) {
        whatsHappening.innerHTML = "Switching elements" // second display message
        if (!(ijValueArray[1] == elementArray.length - 1)) {
            whatsHappening.innerHTML = "Switching elements"
        }
        else {
            whatsHappening.innerHTML = "Moving i and j" // fixes slight aesthetic error caused by rapid tranisioning of messages when the end of the array is hit
        }
        switchElements(speedFactor, oldNumber, number)
    }
    else if (state == "resetIAndJ") {
        returnIAndJ()
    }
}

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
    myList = []
    for (i in elementArray) {
        myList.push(elementArray[i].value)
    }
    if (sorted) {
        for (i in elementArray) {
            elementArray[i].color = sortedColor
            elementArray[i].draw()
        }
        whatsHappening.innerHTML = "Done!"
        cancelAnimationFrame(myReq)
        return
    }
    partition(referenceNumber, number, speed)
    number += 1
  }

  isBeginning = true // used in main() that is called when SORT! button is pressed
  initialize()