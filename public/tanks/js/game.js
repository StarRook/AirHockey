$(document).ready(function(){

  const tankImage = new Image();
  tankImage.src = "../images/tank.png";
  const pipeImage = new Image();
  pipeImage.src = "../images/tank_pipe.png";
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const width = canvas.scrollWidth;
  const height = canvas.scrollHeight;

  const mousePos = {x: 0, y: 0};
  const PROJECTILES = [];
  const CLOUDS = [];
  const HOLES = [];
  const GRAVITY = 0.4;
  const TANKS = [{
    img: tankImage,
    pipeImg: pipeImage,
    x: 200,
    y: 50,
    speedY: 0,
  }];
  const wind = {
    speed: -0.05,
    loop: 0,
  };



  const SKYPATH = [[-10, -10], [width + 10, -10], [width + 10, 500], [-10, 500]];
  let sky = null;

  for (let i = 0;  i < 3; i++) {
    CLOUDS.push(createCloud());
  }

  console.log(CLOUDS);

  loop();

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'd') {
      TANKS[0].x = ++TANKS[0].x;
    } else if (ev.key === 'a') {
      TANKS[0].x = --TANKS[0].x;
    }
  });

  document.addEventListener('mousemove', (ev) => {
    mousePos.x = ev.layerX;
    mousePos.y = ev.layerY;
  });

  document.addEventListener('mousedown', (ev) => {
    if (ev.which === 1) {

      console.log(ev);

      const mouseX = ev.layerX;
      const mouseY = ev.layerY;

      // Calculate the x and y diff to tank
      const diffX = mouseX - TANKS[0].x;
      const diffY = mouseY - TANKS[0].y;

      console.log(diffX / 10, diffY / 10);

      PROJECTILES.push({
        x: TANKS[0].x + 21,
        y: TANKS[0].y - 10,
        forceX: constrain(12, -12, diffX / 10),
        forceY: constrain(12, -12, (diffY / 10) * -1),
        blastRadius: 30,
        r: 2,
      });
    }
  });

  function constrain(maxValue, minValue, curValue) {
    if (curValue <= maxValue && curValue >= minValue) {
      return curValue;
    } else {
      if (curValue > maxValue) {
        curValue = maxValue;
      } else {
        curValue = minValue;
      }
      return curValue;
    }
  }

  function loop() {
    draw();
    update();
    requestAnimationFrame(loop);
  }

  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw ground color
    ctx.fillStyle = "#b55b00";
    ctx.fillRect(0, 0, width, height);

    // Draw sky path
    sky = new Path2D();
    sky.moveTo(SKYPATH[0][0], SKYPATH[0][1]);
    sky.lineTo(SKYPATH[1][0], SKYPATH[1][1]);
    sky.lineTo(SKYPATH[2][0], SKYPATH[2][1]);
    sky.lineTo(SKYPATH[3][0], SKYPATH[3][1]);
    sky.closePath();
    ctx.fillStyle = "#3baae7";
    ctx.lineWidth = '10';
    ctx.strokeStyle = "#1c9412";
    ctx.fill(sky);

    // Draw holes
    for (const hole of HOLES) {
      ctx.beginPath();
      ctx.arc(hole.x, hole.y, hole.r, 0, 2 * Math.PI);
      ctx.fillStyle = '#3baae7';
      ctx.lineWidth = '1';
      ctx.strokeStyle = '#3baae7';
      ctx.fill();
      ctx.stroke();
    }

    // Draw projectiles
    for (const projectile of PROJECTILES) {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.r, 0, 2 * Math.PI);
      ctx.lineWidth = "1";
      ctx.strokeStyle = "#000";
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.stroke();
    }

    // Draw tanks
    for (const tank of TANKS) {
      ctx.drawImage(tank.pipeImg, tank.x + 21, tank.y - 15);
      ctx.drawImage(tank.img, tank.x, tank.y);
    }

    // Draw clouds
    ctx.lineWidth = '1';
    ctx.strokeStyle = "#FFF";
    for (const cloud of CLOUDS) {
      const points = cloud;
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      ctx.quadraticCurveTo(points[1][0], points[1][1], points[2][0], points[2][1]);
      ctx.quadraticCurveTo(points[3][0], points[3][1], points[4][0], points[4][1]);
      ctx.quadraticCurveTo(points[5][0], points[5][1], points[6][0], points[6][1]);
      ctx.closePath();
      ctx.fillStyle = "#FFF";
      ctx.fill();
      ctx.stroke();
    }

    // Draw guidance line
    ctx.beginPath();
    ctx.moveTo(TANKS[0].x + 22, TANKS[0].y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  }

  function update() {
    for (const tank of TANKS) {
      if (ctx.isPointInPath(sky, tank.x, tank.y + 19)) {
        tank.speedY = tank.speedY + GRAVITY;
        tank.y = tank.y + tank.speedY;
        if (tank.speedY > 5) {
          tank.speedY = 5;
        }
      }
    }
    for (let i = 0; i < PROJECTILES.length; i++) {
      const projectile = PROJECTILES[i];
      // Update projectile location
      projectile.x = projectile.x + projectile.forceX;
      projectile.y = projectile.y - projectile.forceY;

      let notInsideHole = true;

      for (const hole of HOLES) {
        if (Math.sqrt((hole.x-projectile.x)*(hole.x-projectile.x) + (hole.y-projectile.y)*(hole.y-projectile.y)) < hole.r) {
          notInsideHole = false;
        }
      }
      if (!ctx.isPointInPath(sky, projectile.x, projectile.y) && notInsideHole) {
        HOLES.push({
          x: projectile.x,
          y: projectile.y,
          r: projectile.blastRadius,
        });
        PROJECTILES.splice(i, 1);
      }

      // Calculate new projectile forces
      projectile.forceX = projectile.forceX + wind.speed;
      projectile.forceY = projectile.forceY - GRAVITY;
    }
  }

  function createCloud() {
    return getCloudCoords(null);
  }

  function getCloudCoords(coords) {

    const data = coords;

    if (data === null) {
      const p1x = Math.floor(Math.random() * width);
      const p1y = Math.floor(Math.random() * 150);
      return getCloudCoords([[p1x, p1y]]);
    } else {
      const nextCoords = [];
      // Get next X
      nextCoords.push((Math.floor(Math.random() * 45) + 10) + data[data.length - 1][0]);
      // Get next Y
      if (data.length % 2 === 0) {
        nextCoords.push(data[data.length - 1][1] + Math.floor(Math.random() * 25) + 10);
      } else {
        nextCoords.push(data[data.length - 1][1] - (Math.floor(Math.random() * 25) + 10));
      }
      // Push to data and get next coords if length < 7
      data.push(nextCoords);
      if (data.length < 7) {
        return getCloudCoords(data);
      } else {
        data[data.length - 1][1] = data[0][1];
        return data;
      }
    }
  }

});