$(document).ready(function(){

  const tankImage = new Image();
  tankImage.src = "../images/tank.png";
  const pipeImage = new Image();
  pipeImage.src = "../images/tank_pipe.png";
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const width = canvas.scrollWidth;
  const height = canvas.scrollHeight;

  const PROJECTILES = [];
  const CLOUDS = [];
  const GRAVITY = 0.4;
  const TANKS = [{
    img: tankImage,
    pipeImg: pipeImage,
    x: 200,
    y: 50,
    speedX: 0,
    speedY: 0,
  }];
  const wind = {
    speed: -2,
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

  document.addEventListener('mousedown', (ev) => {
    if (ev.which === 1) {
      PROJECTILES.push({
        x: TANKS[0].x + 21,
        y: TANKS[0].y - 10,
        vel: 4,
        force: 50,
      });
    }
  });

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

    // Draw projectiles
    for (const projectile of PROJECTILES) {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#000';
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
      projectile.x = projectile.x + projectile.vel;
      if (projectile.force > 0) {
        projectile.force = projectile.force - GRAVITY;
        projectile.y = projectile.y - (projectile.force / 10);
      } else {
        projectile.force = projectile.force - GRAVITY;
        projectile.y = projectile.y + (-projectile.force / 10)
      }
      if (projectile.x < 0 || projectile.x > width) {
        PROJECTILES.splice(i, 1);
      }
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
        console.log('Even', data[data.length - 1][1]);
        nextCoords.push(data[data.length - 1][1] + Math.floor(Math.random() * 25) + 10);
      } else {
        console.log('Odd', data[data.length - 1][1]);
        nextCoords.push(data[data.length - 1][1] - (Math.floor(Math.random() * 25) + 10));
      }
      console.log(nextCoords);
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