let fits = JSON.parse(localStorage.getItem("fits")) || []
let loadouts = JSON.parse(localStorage.getItem("loadouts")) || []

let mode = "fits"

const fitsContainer = document.getElementById("fits")
const categoriesContainer = document.getElementById("categories")
const searchInput = document.getElementById("search")

let editingIndex = null

/* get active list */

function getCurrent(){
return mode === "fits" ? fits : loadouts
}

/* save */

function save(){
localStorage.setItem("fits", JSON.stringify(fits))
localStorage.setItem("loadouts", JSON.stringify(loadouts))
}

/* tab switching */

document.getElementById("fitsTab").onclick = () => {

mode = "fits"

document.getElementById("addTitle").textContent = "Add Fit"
document.getElementById("cmd").placeholder = "!shirt 123 | !hat 456"

setActiveTab()
render()

}

document.getElementById("loadoutsTab").onclick = () => {

mode = "loadouts"

document.getElementById("addTitle").textContent = "Add Loadout"
document.getElementById("cmd").placeholder = "!s ak+ref+supp"

setActiveTab()
render()

}

function setActiveTab(){

document.getElementById("fitsTab").classList.toggle("active",mode==="fits")
document.getElementById("loadoutsTab").classList.toggle("active",mode==="loadouts")

}

/* add item */

function addItem(){

const list = getCurrent()

const item = {

name: document.getElementById("name").value.trim(),

category: document.getElementById("category").value.trim() || "Unsorted",

tags: document.getElementById("tags").value
.split(",")
.map(t=>t.trim())
.filter(Boolean),

cmd: document.getElementById("cmd").value.trim(),

color: editingIndex !== null ? list[editingIndex].color : ""

}

if(editingIndex !== null){

list[editingIndex] = item
editingIndex = null

}else{

list.push(item)

}

save()
render()

document.getElementById("name").value=""
document.getElementById("category").value=""
document.getElementById("tags").value=""
document.getElementById("cmd").value=""

}

/* edit */

function editItem(index){

const list = getCurrent()

const f = list[index]

document.getElementById("name").value = f.name
document.getElementById("category").value = f.category
document.getElementById("tags").value = f.tags.join(", ")
document.getElementById("cmd").value = f.cmd

editingIndex = index

window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})

}

/* delete */

function deleteItem(index){

const list = getCurrent()

if(confirm("Delete item?")){

list.splice(index,1)

save()
render()

}

}

/* set color */

function setColor(index,color){

const list = getCurrent()

list[index].color = color

save()
render()

}

/* copy */

function copyCommand(cmd){

navigator.clipboard.writeText(cmd)

}

/* create edit menu */

function createMenu(index){

const menu = document.createElement("div")
menu.className="menu"

menu.innerHTML = `
<div data-action="edit">Edit</div>
<div data-action="delete">Delete</div>
<hr>
<div data-action="red">Red</div>
<div data-action="blue">Blue</div>
<div data-action="green">Green</div>
<div data-action="purple">Purple</div>
<div data-action="orange">Orange</div>
`

menu.onclick = (e)=>{

const action = e.target.dataset.action

if(action==="edit") editItem(index)
if(action==="delete") deleteItem(index)

if(["red","blue","green","purple","orange"].includes(action)){
setColor(index,action)
}

menu.remove()

}

return menu

}

/* render cards */

function render(){

const list = getCurrent()

const search = (searchInput.value || "").toLowerCase()

fitsContainer.innerHTML=""

list
.map((item,index)=>({item,index}))
.filter(o =>
(o.item.name || "").toLowerCase().includes(search) ||
(o.item.tags || []).join(" ").toLowerCase().includes(search)
)
.forEach(o=>{

const f = o.item
const index = o.index

const tagsHTML = f.tags.map(t=>`<span>${t}</span>`).join("")

const card = document.createElement("div")
card.className="card"

if(f.color) card.dataset.color = f.color

card.innerHTML = `
<img src="icon1.png" class="edit-icon">

<h3>${f.name}</h3>

<div class="meta">${f.category}</div>

<div class="tags">${tagsHTML}</div>

<code>${f.cmd}</code>

<button class="copy-btn">Copy</button>
`

card.querySelector(".copy-btn").onclick = () => copyCommand(f.cmd)

const icon = card.querySelector(".edit-icon")

icon.onclick = (e)=>{

e.stopPropagation()

const existing = card.querySelector(".menu")

if(existing){
existing.remove()
return
}

const menu = createMenu(index)
card.appendChild(menu)

}

fitsContainer.appendChild(card)

})

renderCategories()

}

/* categories */

function renderCategories(){

const list = getCurrent()

let categories = {}

list.forEach((f,i)=>{

if(!categories[f.category]) categories[f.category] = []

categories[f.category].push({item:f,index:i})

})

categoriesContainer.innerHTML=""

for(const cat in categories){

const block = document.createElement("div")
block.className="category"

block.innerHTML = `<div class="category-title">${cat}</div>`

categories[cat].forEach(o=>{

const item = document.createElement("div")
item.className="category-item"

item.textContent = o.item.name

item.onclick = ()=>{

searchInput.value = o.item.name
render()

}

block.appendChild(item)

})

categoriesContainer.appendChild(block)

}

}

/* events */

document.getElementById("saveBtn").onclick = addItem
searchInput.addEventListener("input", render)

/* initial render */

setActiveTab()
render()