let fits = JSON.parse(localStorage.getItem("fits")) || []

const fitsContainer = document.getElementById("fits")
const categoriesContainer = document.getElementById("categories")
const searchInput = document.getElementById("search")

let editingIndex = null

/* normalize old saved data */
fits = fits.map(f => ({
name: f.name || "Unnamed Fit",
category: f.category || "Unsorted",
tags: Array.isArray(f.tags) ? f.tags : [],
cmd: f.cmd || ""
}))

function saveFits(){
localStorage.setItem("fits", JSON.stringify(fits))
}

function addFit(){

const name = document.getElementById("name").value.trim()
const category = document.getElementById("category").value.trim() || "Unsorted"
const tags = document.getElementById("tags").value
.split(",")
.map(t=>t.trim())
.filter(Boolean)

const cmd = document.getElementById("cmd").value.trim()

const fit = { name, category, tags, cmd }

if(editingIndex !== null){

fits[editingIndex] = fit
editingIndex = null

}else{

fits.push(fit)

}

saveFits()
render()

document.getElementById("name").value=""
document.getElementById("category").value=""
document.getElementById("tags").value=""
document.getElementById("cmd").value=""
}

function editFit(index){

const f = fits[index]

document.getElementById("name").value = f.name
document.getElementById("category").value = f.category
document.getElementById("tags").value = f.tags.join(", ")
document.getElementById("cmd").value = f.cmd

editingIndex = index

window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"})
}

function copyCommand(cmd){
navigator.clipboard.writeText(cmd)
}

function render(){

const search = (searchInput.value || "").toLowerCase()

fitsContainer.innerHTML=""

const filtered = fits
.map((fit,index)=>({fit,index}))
.filter(o =>
(o.fit.name || "").toLowerCase().includes(search) ||
(o.fit.tags || []).join(" ").toLowerCase().includes(search)
)

filtered.forEach(o=>{

const f = o.fit
const index = o.index

const tagsHTML = f.tags.map(t=>`<span>${t}</span>`).join("")

const card = document.createElement("div")
card.className="card"

card.innerHTML = `
<img src="icon1.png" class="edit-icon" title="Edit fit">

<h3>${f.name}</h3>
<div class="meta">${f.category}</div>

<div class="tags">${tagsHTML}</div>

<code>${f.cmd}</code>

<button class="copy-btn">Copy</button>
`

card.querySelector(".copy-btn").onclick = () => copyCommand(f.cmd)

card.querySelector(".edit-icon").onclick = () => editFit(index)

fitsContainer.appendChild(card)

})

renderCategories()
}

function renderCategories(){

let categories = {}

fits.forEach((f,i)=>{
if(!categories[f.category]) categories[f.category]=[]
categories[f.category].push({fit:f,index:i})
})

categoriesContainer.innerHTML=""

for(const cat in categories){

const block=document.createElement("div")
block.className="category"

block.innerHTML=`<div class="category-title">${cat}</div>`

categories[cat].forEach(o=>{

const item=document.createElement("div")
item.className="category-item"
item.textContent=o.fit.name

item.onclick=()=>{
searchInput.value=o.fit.name
render()
}

block.appendChild(item)

})

categoriesContainer.appendChild(block)

}

}

document.getElementById("saveBtn").onclick = addFit
searchInput.addEventListener("input", render)

render()