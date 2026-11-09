(()=>{const canvas=document.querySelector('#brand3d');if(!canvas)return;const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.topbar nav');menu?.addEventListener('click',()=>nav.classList.toggle('open'));nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));const glow=document.querySelector('.cursor-glow');window.addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}});if(!window.THREE){canvas.style.display='none';return}try{
const THREE=window.THREE,scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.15,9.5);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
const group=new THREE.Group();scene.add(group);
scene.add(new THREE.HemisphereLight(0xffffff,0x241006,2));
const key=new THREE.PointLight(0xff741c,115,24);key.position.set(3,4,6);scene.add(key);
const rim=new THREE.PointLight(0xff3b08,85,22);rim.position.set(-4,-2,-3);scene.add(rim);
const fill=new THREE.PointLight(0xffffff,38,18);fill.position.set(-3,2,5);scene.add(fill);
const mat=(color,metalness=.2,roughness=.35)=>new THREE.MeshPhysicalMaterial({color,metalness,roughness,clearcoat:.7,clearcoatRoughness:.2});
const dark=mat(0x15171b,.65,.28),edge=mat(0x34383e,.8,.2),orange=mat(0xff6900,.42,.24),screenMat=new THREE.MeshBasicMaterial({color:0x08090c});
function box(w,h,d,material,x,y,z,parent=group){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m}
function roundedScreenTexture(){const c=document.createElement('canvas');c.width=900;c.height=600;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,900,600);g.addColorStop(0,'#16191e');g.addColorStop(.55,'#090a0c');g.addColorStop(1,'#321300');x.fillStyle=g;x.fillRect(0,0,900,600);x.strokeStyle='rgba(255,112,0,.65)';x.lineWidth=3;x.beginPath();x.arc(450,285,180,0,Math.PI*2);x.stroke();x.strokeStyle='rgba(255,112,0,.35)';x.beginPath();x.ellipse(450,285,260,90,-.45,0,Math.PI*2);x.stroke();x.fillStyle='#ff7100';x.font='bold 150px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('CR',450,270);x.fillStyle='#f7f3ed';x.font='500 28px Arial';x.fillText('CODE RUNNERS',450,430);x.fillStyle='#ff7100';x.fillRect(90,510,720,3);return new THREE.CanvasTexture(c)}
const laptop=new THREE.Group();group.add(laptop);
const base=box(3.25,.16,2.05,edge,-.62,-.83,.1,laptop);base.rotation.x=-.12;
const keyboard=box(2.75,.025,1.42,dark,-.62,-.735,.08,laptop);keyboard.rotation.x=-.12;
for(let row=0;row<4;row++)for(let col=0;col<13;col++){const k=box(.14,.018,.16,mat(0x55565a,.4,.5),-1.82+col*.2,-.708,.62-row*.28,laptop);k.rotation.x=-.12}
const track=box(.72,.018,.43,mat(0x77797d,.5,.35),-.62,-.70,-.49,laptop);track.rotation.x=-.12;
const screenFrame=box(3.18,2.02,.13,dark,-.62,.25,-.91,laptop);screenFrame.rotation.x=-.08;
const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.96,1.8),new THREE.MeshBasicMaterial({map:roundedScreenTexture()}));screen.position.set(-.62,.26,-.835);screen.rotation.x=-.08;laptop.add(screen);
const hinge=box(2.9,.09,.14,edge,-.62,-.78,-.85,laptop);hinge.rotation.x=-.08;
laptop.rotation.y=.18;laptop.rotation.z=-.04;laptop.position.set(-.35,.03,0);laptop.scale.set(.94,.94,.94);
const bag=new THREE.Group();group.add(bag);bag.position.set(1.62,-.35,.4);bag.rotation.y=-.22;bag.rotation.z=-.035;
box(1.12,1.38,.55,orange,0,0,0,bag);
const front=new THREE.Mesh(new THREE.PlaneGeometry(1.02,1.27),new THREE.MeshBasicMaterial({map:(()=>{const c=document.createElement('canvas');c.width=512;c.height=640;const x=c.getContext('2d');x.fillStyle='#ff7100';x.fillRect(0,0,512,640);x.strokeStyle='#17100b';x.lineWidth=13;x.beginPath();x.moveTo(110,220);x.lineTo(110,120);x.lineTo(256,55);x.lineTo(402,120);x.lineTo(402,500);x.lineTo(256,575);x.lineTo(110,500);x.closePath();x.stroke();x.fillStyle='#17100b';x.font='bold 180px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('CR',256,315);x.font='bold 28px Arial';x.fillText('CODE RUNNERS',256,500);return new THREE.CanvasTexture(c)})()}));front.position.set(0,0,.281);bag.add(front);
const handle=new THREE.Mesh(new THREE.TorusGeometry(.29,.045,12,48,Math.PI),mat(0x19130e,.35,.3));handle.position.set(0,.72,0);handle.rotation.z=Math.PI;bag.add(handle);
const parcel=new THREE.Group();group.add(parcel);parcel.position.set(1.65,-1.13,-.35);parcel.rotation.set(.12,-.35,-.08);box(.95,.62,.88,mat(0x28221d,.12,.65),0,0,0,parcel);box(.14,.63,.9,orange,0,0,0.005,parcel);box(.97,.12,.9,orange,0,.25,0,parcel);
const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.9,.012,8,160),new THREE.MeshBasicMaterial({color:0xff7100,transparent:true,opacity:.58}));orbit.rotation.set(1.05,.25,-.35);group.add(orbit);
const orbit2=new THREE.Mesh(new THREE.TorusGeometry(2.55,.008,8,160),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.2}));orbit2.rotation.set(.45,1.1,.4);group.add(orbit2);
const particles=new THREE.Group();for(let i=0;i<95;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(Math.random()*.018+.006,8,8),new THREE.MeshBasicMaterial({color:i%3===0?0xff7100:0xaaaeb4,transparent:true,opacity:.55}));p.position.set((Math.random()-.5)*8,(Math.random()-.5)*6,(Math.random()-.5)*3);particles.add(p)}scene.add(particles);
let targetX=0,targetY=0,drag=false,prevX=0,prevY=0;
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();targetY=((e.clientX-r.left)/r.width-.5)*.5;targetX=((e.clientY-r.top)/r.height-.5)*.32});
canvas.addEventListener('pointerdown',e=>{drag=true;prevX=e.clientX;prevY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointerup',()=>drag=false);
canvas.addEventListener('pointermove',e=>{if(drag){targetY+=(e.clientX-prevX)*.006;targetX+=(e.clientY-prevY)*.006;prevX=e.clientX;prevY=e.clientY}});
function resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(r.height,1);camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();group.rotation.y+=(targetY+Math.sin(t*.3)*.08-group.rotation.y)*.035;group.rotation.x+=(targetX+Math.sin(t*.4)*.045-group.rotation.x)*.035;group.position.y=Math.sin(t*.75)*.07;orbit.rotation.z=t*.08;orbit2.rotation.z=-t*.055;particles.rotation.y=t*.018;renderer.render(scene,camera)}animate();
}catch(e){console.warn('3D commerce scene fallback active',e);canvas.style.display='none'}
if(window.gsap&&window.ScrollTrigger&&!matchMedia('(prefers-reduced-motion: reduce)').matches){gsap.registerPlugin(ScrollTrigger);gsap.utils.toArray('.section-index,.intro-content,.cap-list article,.work-card,.process-grid article,.contact-content').forEach(el=>gsap.from(el,{y:34,opacity:0,duration:.75,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%'}}));gsap.to('.manifesto-mark',{rotation:360,scrollTrigger:{trigger:'.manifesto',start:'top bottom',end:'bottom top',scrub:1}})}})();