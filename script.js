"use strict";
const world = document.getElementById("world");
const pauseelem = document.getElementById("paused");
const curloc = document.getElementById("curloc");
let particleData = [];
let plateData = [];
let lastPlacedPlate = null;

const createNeutron = (x, y, vx, vy) => {
    const neutron = document.createElement('span')
    neutron.className = "particle neutron"
    neutron.style.left = x + "vh"
    neutron.style.bottom = y + "vh"
    world.appendChild(neutron)
    particleData.push({
        element: neutron,x: x,y: y,vx: vx,vy: vy,mass: 1, charge: 0
    })
    return neutron
}
const pxtovh = (px)=>{return px / window.innerHeight * 100
}
document.body.addEventListener("contextmenu", (e)=>{
    e.preventDefault()
    const rect = world.getBoundingClientRect()
    const x = pxtovh(e.clientX - rect.left)
    const y = pxtovh(rect.bottom - e.clientY)
    if (!delParticleNearest(x, y)) {
        delPlateNearest(x, y)
    }
})


document.body.addEventListener("mousemove", (e)=>{
    const rect = world.getBoundingClientRect()
    const x = pxtovh(e.clientX - rect.left)
    const y = pxtovh(rect.bottom - e.clientY)
    curloc.innerText = `Cursor Location: x=${x.toFixed(2)} vh, y=${y.toFixed(2)} vh`
})




const createProton = (x, y, vx, vy) => {
    const proton = document.createElement('span')
    proton.className = "particle proton"
    proton.innerText = "+"
    proton.style.left = x + "vh"
    proton.style.bottom = y + "vh"
    world.appendChild(proton)
    particleData.push({element: proton,x: x,y: y,vx: vx,vy: vy,mass: 1, charge: 1
    })
    return proton
}

const createElectron = (x, y, vx, vy) => {
    const electron = document.createElement('span')
    electron.className = "particle electron"
    electron.style.left = x + "vh"
    electron.style.bottom = y + "vh"
    electron.innerText = "-"
    world.appendChild(electron)
    particleData.push({
        element: electron,
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        mass: 0.0005, 
        charge: -1
    })
    return electron
}

const delParticleNearest = (x, y) => {
    let nearestIndex = -1
    let nearestDist = Infinity
    for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i]
        const dx = p.x - x
        const dy = p.y - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < nearestDist) {
            nearestDist = dist
            nearestIndex = i
        }
    }
    if (nearestIndex !== -1) {
        const p = particleData[nearestIndex]
        p.element.remove()
        particleData.splice(nearestIndex, 1)
        return true
    }
    return false
}

const delPlateNearest = (x, y) => {
    let nearestIndex = -1
    let nearestDist = Infinity
    for (let i = 0; i < plateData.length; i++) {
        const p = plateData[i]
        const cx = p.x + p.width / 2
        const cy = p.y + p.height / 2
        const dx = cx - x
        const dy = cy - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < nearestDist) {
            nearestDist = dist
            nearestIndex = i
        }
    }
    if (nearestIndex !== -1) {
        const p = plateData[nearestIndex]
        p.element.remove()
        plateData.splice(nearestIndex, 1)
        if (lastPlacedPlate === p) lastPlacedPlate = null
        return true
    }
    return false
}

const createBarMagnet = (x, y, width, height, rotation = 0) => {
    const plate = document.createElement('div')
    plate.className = "plate plate-barmagnet"
    plate.style.left = x + "vh"
    plate.style.bottom = y + "vh"
    plate.style.width = width + "vh"
    plate.style.height = height + "vh"
    plate.style.transform = `rotate(${rotation}deg)`
    plate.style.transformOrigin = "center center"
    plate.innerHTML = '<div class="pole-n">N</div><div class="pole-s">S</div>'
    world.appendChild(plate)
    const data = {
        element: plate,
        type: 'barmagnet',
        x, y, width, height, rotation,
        strength: 50 // magnetic field strength
    }
    plateData.push(data)
    lastPlacedPlate = data
    return data
}

/*const createHorseshoeMagnet = (x, y, width, height, rotation = 0) => {
    const plate = document.createElement('div')
    plate.className = "plate plate-horseshoe"
    plate.style.left = x + "vh"
    plate.style.bottom = y + "vh"
    plate.style.width = width + "vh"
    plate.style.height = height + "vh"
    const borderWidth = Math.min(width, height) * 0.35
    plate.style.borderWidth = borderWidth + "vh"
    plate.style.transform = `rotate(${rotation}deg)`
    plate.style.transformOrigin = "center center"
    world.appendChild(plate)
    const data = {
        element: plate,
        type: 'horseshoe',
        x, y, width, height, rotation,
        strength: 800 // stronger in the gap
    }
    plateData.push(data)
    lastPlacedPlate = data
    return data
}*/

const createElectricPlate = (x, y, width, height, rotation = 0) => {
    const plate = document.createElement('div')
    plate.className = "plate plate-electricplate"
    plate.style.left = x + "vh"
    plate.style.bottom = y + "vh"
    plate.style.width = width + "vh"
    plate.style.height = height + "vh"
    plate.style.transform = `rotate(${rotation}deg)`
    plate.style.transformOrigin = "center center"
    plate.innerHTML = '<span style="color:#ffcc00;font-size:' + Math.min(width, height) * 0.4 + 'vh">⚡</span>'
    world.appendChild(plate)
    const data = {
        element: plate,
        type: 'electricplate',
        x, y, width, height, rotation,
        strength: 30, // electric field strength
        charge: -1 // negative plate
    }
    plateData.push(data)
    lastPlacedPlate = data
    return data
}
const createHorseshoeMagnet = (a,b,c,d,e)=>{alert("didnt we just remove horseshoes")}

// Calculate field effects from plates on a particle
const calcPlateForces = (particle) => {
    let fx = 0
    let fy = 0
    const px = particle.x + particleOffset
    const py = particle.y + particleOffset
    
    for (const plate of plateData) {
        const cx = plate.x + plate.width / 2
        const cy = plate.y + plate.height / 2
        const dx = px - cx
        const dy = py - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 0.5) continue // minimum distance to prevent extreme forces
        const nx = dx / dist
        const ny = dy / dist
        const rotRad = plate.rotation * Math.PI / 180
        
        if (plate.type === 'barmagnet') {
            if (particle.charge !== 0) {
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy)
                if (speed > 0.01) {
                    const bx = Math.cos(rotRad)
                    const by = Math.sin(rotRad)
                    const distCubed = dist * dist * dist
                    const fieldStrength = plate.strength / (distCubed + 10)
                    const crossZ = particle.vx * by - particle.vy * bx
                    const perpX = -particle.vy / speed
                    const perpY = particle.vx / speed
                    const forceMag = particle.charge * fieldStrength * crossZ * 0.1
                    
                    fx += forceMag * perpX
                    fy += forceMag * perpY
                }
            }
        } else if (plate.type === 'electricplate') {
            if (particle.charge !== 0) {
                const ex = -Math.sin(rotRad)
                const ey = Math.cos(rotRad)
                const fieldStrength = plate.strength * plate.charge / (dist * dist + 5)
                fx += -particle.charge * fieldStrength * ex * 0.5
                fy += -particle.charge * fieldStrength * ey * 0.5
            }
        }
    }
    
    return { fx, fy }
}
window.paused = false
window.launchPower = 1
const launchPowerSlider = document.getElementById("launchPower")
const launchPowerValue = document.getElementById("launchPowerValue")
launchPowerSlider.addEventListener("input", (e) => {
    window.launchPower = parseFloat(e.target.value)
    launchPowerValue.innerText = window.launchPower.toFixed(1)
})

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        window.paused = !window.paused
        pauseelem.classList.toggle("hide", !window.paused)
        if (!window.paused) {
            doPhysics()
        }
    }
    if (e.code === "KeyC" && e.shiftKey) {
        for (const p of particleData) {
            p.element.remove()
        }
        particleData.length = 0
        for (const p of plateData) {
            p.element.remove()
        }
        plateData.length = 0
        lastPlacedPlate = null
    }
})

createElectron(10, 10, 0, 100)
createProton(20, 10, 0, 0)
createNeutron(30, 10, 0, 0)

const k_electric = 50    //electric force strength
const k_gravity = 0.01   //gravity force strength (very weak)
const snt = 3            //strong nuclear force threshold distance (vh)
const k_strong = 100     //strong nuclear force strength
const dt = 0.016         //time step (~60fps)
const damping = 0.99     //slight damping to stabilize
const minDistance = 0.0000001 //minimum distance to prevent extreme forces

const calcAcceleration = (p1, index) => {
    let fx = 0
    let fy = 0
    for (let j = 0; j < particleData.length; j++) {
        if (index === j) continue
        const p2 = particleData[j]
        let dx = p2.x - p1.x
        let dy = p2.y - p1.y
        let r = Math.sqrt(dx * dx + dy * dy)
        if (r < minDistance) r = minDistance
        let nx = dx / r
        let ny = dy / r
        //F = k*q1*q2/r^2
        let f_electric = -k_electric * p1.charge * p2.charge / (r * r)
        let f_gravity = k_gravity * p1.mass * p2.mass / (r * r)
        let f_strong = 0
        const isNucleon1 = p1.element.classList.contains("proton") || p1.element.classList.contains("neutron")
        const isNucleon2 = p2.element.classList.contains("proton") || p2.element.classList.contains("neutron")
        if (isNucleon1 && isNucleon2 && r < snt) {
            f_strong = k_strong * (1 - r / snt)
        }
        let f_total = f_electric + f_gravity + f_strong
        fx += f_total * nx
        fy += f_total * ny
    }
    
    const plateForces = calcPlateForces(p1)
    fx += plateForces.fx
    fy += plateForces.fy
    
    return { ax: fx / p1.mass, ay: fy / p1.mass }
}

const doPhysics = () => {
    let accelerations = []
    for (let i = 0; i < particleData.length; i++) {
        accelerations.push(calcAcceleration(particleData[i], i))
    }
    for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i]
        const a = accelerations[i]
        p.x += p.vx * dt + 0.5 * a.ax * dt * dt
        p.y += p.vy * dt + 0.5 * a.ay * dt * dt
    }
    let newAccelerations = []
    for (let i = 0; i < particleData.length; i++) {
        newAccelerations.push(calcAcceleration(particleData[i], i))
    }
    for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i]
        p.vx += 0.5 * (accelerations[i].ax + newAccelerations[i].ax) * dt
        p.vy += 0.5 * (accelerations[i].ay + newAccelerations[i].ay) * dt
    }
    for (let i = particleData.length - 1; i >= 0; i--) {
        const p = particleData[i]
        if (Math.abs(p.x) > 200 || Math.abs(p.y) > 200) {
            p.element.remove()
            particleData.splice(i, 1)
            console.log("particle removed, x,y,type,vx,vy =", p.x, p.y, p.element.className, p.vx, p.vy)
            continue
        }
        p.element.style.left = p.x + "vh"
        p.element.style.bottom = p.y + "vh"
    }
    if (!window.paused)
        requestAnimationFrame(doPhysics)
}


window.selected = "proton"
const selectproton = document.getElementById("selectproton")
const selectelectron = document.getElementById("selectelectron")
const selectneutron = document.getElementById("selectneutron")
const selectbarmagnet = document.getElementById("selectbarmagnet")
const selectelectricplate = document.getElementById("selectelectricplate")

selectproton.classList.add("selected")

const allSelectors = [selectproton, selectelectron, selectneutron, selectbarmagnet, selectelectricplate]
const selectorNames = ["proton", "electron", "neutron", "barmagnet", "electricplate"]

const selectItem = (item) => {
    window.selected = item
    allSelectors.forEach((sel, i) => {
        sel.classList.toggle("selected", selectorNames[i] === item)
    })
}

allSelectors.forEach((sel, i) => {
    sel.addEventListener("click", (e) => {
        selectItem(selectorNames[i])
        e.preventDefault()
        e.stopPropagation()
    })
    sel.addEventListener("mousedown", (e) => { e.stopPropagation() })
})

const isPlateSelected = () => {
    return ["barmagnet", "electricplate"].includes(window.selected)
}

// Drag-to-add: initial point = position, drag vector = velocity
let dragStart = null
let dragPreview = null
let dragArrow = null
let shiftCircle = null
let dragMode = null // 'spawn', 'move', 'launch', 'plate', 'rotate'
let affectedParticles = [] // particles being moved by shift+drag
let platePreview = null

const particleOffset = 5

const defaultPlateSize = { width: 15, height: 8 }

const createPlatePreview = (type, x, y, width, height) => {
    const plate = document.createElement('div')
    if (type === 'barmagnet') {
        plate.className = "plate plate-barmagnet plate-preview"
        plate.innerHTML = '<div class="pole-n">N</div><div class="pole-s">S</div>'
    } else if (type === 'electricplate') {
        plate.className = "plate plate-electricplate plate-preview"
        plate.innerHTML = '<span style="color:#ffcc00;font-size:' + Math.min(width, height) * 0.4 + 'vh">⚡</span>'
    }
    plate.style.left = x + "vh"
    plate.style.bottom = y + "vh"
    plate.style.width = width + "vh"
    plate.style.height = height + "vh"
    world.appendChild(plate)
    return plate
}

const findNearestProton = (x, y) => {
    let nearest = null
    let nearestDist = Infinity
    for (const p of particleData) {
        if (p.charge === 1) { // proton
            const dx = p.x + particleOffset - x
            const dy = p.y + particleOffset - y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < nearestDist) {
                nearestDist = dist
                nearest = p
            }
        }
    }
    return { proton: nearest, distance: nearestDist }
}

const updateShiftCircle = (x, y, show) => {
    if (!show) {
        if (shiftCircle) {
            shiftCircle.remove()
            shiftCircle = null
        }
        return
    }
    
    const radius = window.launchPower * 5 // vh
    if (!shiftCircle) {
        shiftCircle = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        shiftCircle.style.position = "absolute"
        shiftCircle.style.left = "0"
        shiftCircle.style.top = "0"
        shiftCircle.style.width = "100%"
        shiftCircle.style.height = "100%"
        shiftCircle.style.pointerEvents = "none"
        shiftCircle.style.overflow = "visible"
        shiftCircle.innerHTML = `<circle id="shift-circle" cx="0" cy="0" r="0" fill="none" stroke="white" stroke-width="2" stroke-dasharray="5,5"/>`
        world.appendChild(shiftCircle)
    }
    
    const circle = shiftCircle.querySelector('#shift-circle')
    const rect = world.getBoundingClientRect()
    const pxX = x * rect.height / 100
    const pxY = rect.height - (y * rect.height / 100)
    const pxRadius = radius * rect.height / 100
    
    circle.setAttribute('cx', pxX)
    circle.setAttribute('cy', pxY)
    circle.setAttribute('r', pxRadius)
}

const getParticlesInRadius = (x, y, radius) => {
    const result = []
    for (let i = 0; i < particleData.length; i++) {
        const p = particleData[i]
        const px = p.x + particleOffset
        const py = p.y + particleOffset
        const dx = px - x
        const dy = py - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= radius) {
            result.push({ index: i, particle: p, offsetX: px - x, offsetY: py - y })
        }
    }
    return result
}

document.body.addEventListener("mousedown", (e)=>{
    if (e.button !== 0) return // only left click
    if (e.target.closest('.selector')) return // ignore clicks on selector
    if (e.target.closest('#controls')) return // ignore clicks on controls
    if (e.target.closest('#hotbar')) return // ignore clicks on hotbar
    
    const rect = world.getBoundingClientRect()
    const x = pxtovh(e.clientX - rect.left)
    const y = pxtovh(rect.bottom - e.clientY)
    
    if (e.altKey && window.paused && lastPlacedPlate && !e.shiftKey && !e.ctrlKey) {
        dragMode = 'rotate'
        dragStart = { x: x, y: y, clientX: e.clientX, clientY: e.clientY, initialRotation: lastPlacedPlate.rotation }
        return
    }
    if (e.ctrlKey && e.shiftKey && !e.altKey && !isPlateSelected()) {
        const { proton, distance } = findNearestProton(x, y)
        if (proton && distance > 0) {
            const orbitalSpeed = Math.sqrt(k_electric / (0.0005 * distance))
            const dx = x - (proton.x + particleOffset)
            const dy = y - (proton.y + particleOffset)
            const nx = dx / distance
            const ny = dy / distance
            const vx = -ny * orbitalSpeed
            const vy = nx * orbitalSpeed
            createElectron(x - particleOffset, y - particleOffset, vx, vy)
        }
        return
    }
    
    if (e.altKey && e.shiftKey && !e.ctrlKey && !isPlateSelected()) {
        const { proton, distance } = findNearestProton(x, y)
        if (proton && distance > 0) {
            const orbitalSpeed = Math.sqrt(k_electric / (0.0005 * distance))
            const dx = x - (proton.x + particleOffset)
            const dy = y - (proton.y + particleOffset)
            const nx = dx / distance
            const ny = dy / distance
            const vx = ny * orbitalSpeed
            const vy = -nx * orbitalSpeed
            createElectron(x - particleOffset, y - particleOffset, vx, vy)
        }
        return
    }
    
    if (e.shiftKey && !e.ctrlKey && !e.altKey && !isPlateSelected()) {
        dragMode = 'move'
        dragStart = { x: x, y: y, clientX: e.clientX, clientY: e.clientY }
        const radius = window.launchPower * 5
        affectedParticles = getParticlesInRadius(x, y, radius)
        return
    }
    
    if (e.ctrlKey && !e.shiftKey && !e.altKey && !isPlateSelected()) {
        dragMode = 'launch'
        dragStart = { x: x, y: y, clientX: e.clientX, clientY: e.clientY }
        const radius = window.launchPower * 5
        affectedParticles = getParticlesInRadius(x, y, radius)
        
        dragArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg")
        dragArrow.style.position = "absolute"
        dragArrow.style.left = "0"
        dragArrow.style.bottom = "0"
        dragArrow.style.width = "100%"
        dragArrow.style.height = "100%"
        dragArrow.style.pointerEvents = "none"
        dragArrow.style.overflow = "visible"
        dragArrow.innerHTML = `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="white"/>
                </marker>
            </defs>
            <line id="arrow-line" x1="0" y1="0" x2="0" y2="0" stroke="white" stroke-width="2" marker-end="url(#arrowhead)"/>
        `
        world.appendChild(dragArrow)
        return
    }
    
    if (isPlateSelected()) {
        dragMode = 'plate'
        dragStart = { x: x, y: y, clientX: e.clientX, clientY: e.clientY }
        platePreview = createPlatePreview(window.selected, x, y, defaultPlateSize.width, defaultPlateSize.height)
        return
    }
    dragMode = 'spawn'
    dragStart = { x: x, y: y, clientX: e.clientX, clientY: e.clientY }
    dragPreview = document.createElement('span')
    dragPreview.className = "particle " + window.selected + " preview"
    dragPreview.style.left = (x - particleOffset) + "vh"
    dragPreview.style.bottom = (y - particleOffset) + "vh"
    dragPreview.style.opacity = "0.25"
    if (window.selected === "proton") dragPreview.innerText = "+"
    else if (window.selected === "electron") dragPreview.innerText = "-"
    world.appendChild(dragPreview)
    dragArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    dragArrow.style.position = "absolute"
    dragArrow.style.left = "0"
    dragArrow.style.bottom = "0"
    dragArrow.style.width = "100%"
    dragArrow.style.height = "100%"
    dragArrow.style.pointerEvents = "none"
    dragArrow.style.overflow = "visible"
    dragArrow.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="white"/>
            </marker>
        </defs>
        <line id="arrow-line" x1="0" y1="0" x2="0" y2="0" stroke="white" stroke-width="2" marker-end="url(#arrowhead)"/>
    `
    world.appendChild(dragArrow)
})

document.body.addEventListener("mouseup", (e)=>{
    if (!dragStart) return
    if (e.button !== 0) return
    
    const rect = world.getBoundingClientRect()
    const endX = pxtovh(e.clientX - rect.left)
    const endY = pxtovh(rect.bottom - e.clientY)
    
    if (dragMode === 'spawn') {
        const vx = (endX - dragStart.x) * 5 * window.launchPower
        const vy = (endY - dragStart.y) * 5 * window.launchPower
        if (window.selected === "proton") {
            createProton(dragStart.x - particleOffset, dragStart.y - particleOffset, vx, vy)
        } else if (window.selected === "electron") {
            createElectron(dragStart.x - particleOffset, dragStart.y - particleOffset, vx, vy)
        } else if (window.selected === "neutron") {
            createNeutron(dragStart.x - particleOffset, dragStart.y - particleOffset, vx, vy)
        }
    } else if (dragMode === 'launch') {
        const vx = (endX - dragStart.x) * 5
        const vy = (endY - dragStart.y) * 5
        for (const { particle } of affectedParticles) {
            particle.vx += vx
            particle.vy += vy
        }
    } else if (dragMode === 'plate') {
        const minX = Math.min(dragStart.x, endX)
        const minY = Math.min(dragStart.y, endY)
        let width = Math.abs(endX - dragStart.x)
        let height = Math.abs(endY - dragStart.y)
        if (width < 2 && height < 2) {
            width = defaultPlateSize.width
            height = defaultPlateSize.height
        }
        if (window.selected === "barmagnet") {
            createBarMagnet(minX, minY, width, height)
        } else if (window.selected === "electricplate") {
            createElectricPlate(minX, minY, width, height)
        }
    } else if (dragMode === 'rotate') {
    }
    if (dragPreview) {
        dragPreview.remove()
        dragPreview = null
    }
    if (dragArrow) {
        dragArrow.remove()
        dragArrow = null
    }
    if (platePreview) {
        platePreview.remove()
        platePreview = null
    }
    dragStart = null
    dragMode = null
    affectedParticles = []
})

document.body.addEventListener("mousemove", (e)=>{
    const rect = world.getBoundingClientRect()
    const x = pxtovh(e.clientX - rect.left)
    const y = pxtovh(rect.bottom - e.clientY)
    curloc.innerText = `Cursor Location: x=${x.toFixed(2)} vh, y=${y.toFixed(2)} vh`
    
    const showCircle = (e.shiftKey || e.ctrlKey) && dragMode !== 'spawn' && dragMode !== 'plate' && !isPlateSelected()
    updateShiftCircle(x, y, showCircle)
    
    if (!dragStart) return
    
    if (dragArrow && (dragMode === 'spawn' || dragMode === 'launch')) {
        const line = dragArrow.querySelector('#arrow-line')
        if (line) {
            const sx = dragStart.clientX - rect.left
            const sy = rect.height - (dragStart.clientY - rect.top)
            const ex = e.clientX - rect.left
            const ey = rect.height - (e.clientY - rect.top)
            
            line.setAttribute('x1', sx)
            line.setAttribute('y1', rect.height - sy)
            line.setAttribute('x2', ex)
            line.setAttribute('y2', rect.height - ey)
        }
    }
    
    if (dragMode === 'move') {
        const dx = x - dragStart.x
        const dy = y - dragStart.y
        for (const { particle, offsetX, offsetY } of affectedParticles) {
            particle.x = dragStart.x + offsetX + dx - particleOffset
            particle.y = dragStart.y + offsetY + dy - particleOffset
            particle.element.style.left = particle.x + "vh"
            particle.element.style.bottom = particle.y + "vh"
        }
    }
    
    if (dragMode === 'plate' && platePreview) {
        const minX = Math.min(dragStart.x, x)
        const minY = Math.min(dragStart.y, y)
        const width = Math.max(Math.abs(x - dragStart.x), 2)
        const height = Math.max(Math.abs(y - dragStart.y), 2)
        
        platePreview.style.left = minX + "vh"
        platePreview.style.bottom = minY + "vh"
        platePreview.style.width = width + "vh"
        platePreview.style.height = height + "vh"
    }
    
    if (dragMode === 'rotate' && lastPlacedPlate) {
        const cx = lastPlacedPlate.x + lastPlacedPlate.width / 2
        const cy = lastPlacedPlate.y + lastPlacedPlate.height / 2
        const dx = x - cx
        const dy = y - cy
        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        
        lastPlacedPlate.rotation = angle
        lastPlacedPlate.element.style.transform = `rotate(${angle}deg)`
    }
})

document.body.addEventListener("keyup", (e) => {
    if (e.key === "Shift") {
        updateShiftCircle(0, 0, false)
    }
})


doPhysics()