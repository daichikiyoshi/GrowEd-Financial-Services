window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');

  // Match the reference image: centered logo + spinner, then a smooth reveal.
  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    mainContent.classList.add('ready');
  }, 2500);

  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  const target = document.getElementById('target');
  const rate = document.getElementById('rate');
  const years = document.getElementById('years');
  const payments = document.getElementById('payments');
  const paymentResult = document.getElementById('paymentResult');
  const contributionResult = document.getElementById('contributionResult');
  const interestResult = document.getElementById('interestResult');
  const chart = document.getElementById('growthChart');

  function money(value) {
    return '₱' + Number(value).toLocaleString('en-PH', {minimumFractionDigits:2, maximumFractionDigits:2});
  }

  function calculate() {
    const fv = Number(target.value);
    const annualRate = Number(rate.value) / 100;
    const yrs = Number(years.value);
    const ppy = Number(payments.value);
    const i = annualRate / ppy;
    const n = yrs * ppy;

    let payment;
    if (i === 0) payment = fv / n;
    else payment = fv / (((Math.pow(1 + i, n) - 1) / i));

    const contributions = payment * n;
    const interest = fv - contributions;
    paymentResult.textContent = money(payment);
    contributionResult.textContent = money(contributions);
    interestResult.textContent = money(interest);
    drawChart(payment, i, ppy, yrs);
  }

  function drawChart(payment, i, ppy, yrs) {
    const ctx = chart.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = chart.clientWidth || 1000;
    const height = chart.clientHeight || 330;
    chart.width = width * dpr;
    chart.height = height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,width,height);

    const pad = {l:45,r:20,t:20,b:35};
    const points = [];
    for(let y=1;y<=yrs;y++){
      const n=y*ppy;
      const value=i===0 ? payment*n : payment*((Math.pow(1+i,n)-1)/i);
      points.push({year:y,value});
    }
    const max = points[points.length-1]?.value || 1;
    const x = y => pad.l + ((y-1)/Math.max(1,yrs-1))*(width-pad.l-pad.r);
    const y = v => height-pad.b-(v/max)*(height-pad.t-pad.b);

    ctx.strokeStyle = '#dbe9df';
    ctx.lineWidth = 1;
    for(let k=0;k<=4;k++){
      const gy=pad.t+k*(height-pad.t-pad.b)/4;
      ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(width-pad.r,gy);ctx.stroke();
    }

    ctx.beginPath();
    points.forEach((p,idx)=>{ if(idx===0) ctx.moveTo(x(p.year),y(p.value)); else ctx.lineTo(x(p.year),y(p.value)); });
    ctx.lineTo(x(points.at(-1).year),height-pad.b);ctx.lineTo(x(1),height-pad.b);ctx.closePath();
    ctx.fillStyle='rgba(20,133,82,.10)';ctx.fill();

    ctx.beginPath();
    points.forEach((p,idx)=>{ if(idx===0) ctx.moveTo(x(p.year),y(p.value)); else ctx.lineTo(x(p.year),y(p.value)); });
    ctx.strokeStyle='#0a6b43';ctx.lineWidth=3;ctx.stroke();

    points.forEach(p=>{
      if(p.year % Math.ceil(yrs/5)===0 || p.year===yrs){
        ctx.beginPath();ctx.arc(x(p.year),y(p.value),4,0,Math.PI*2);ctx.fillStyle='#d7a832';ctx.fill();
      }
    });
  }

  document.getElementById('calculate')?.addEventListener('click', calculate);
  [target,rate,years,payments].forEach(el=>el?.addEventListener('change', calculate));
  window.addEventListener('resize', calculate);
  calculate();
});
