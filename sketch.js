let points = new Array(0);
let pointsCount = 0;
let r = 15;

function setup() {
  createCanvas(windowWidth, windowHeight - 10);
}

function draw() {
  background(240);
  for (i = 0; i < pointsCount; i++) {
    if (i == 0) {
      fill(0, 200, 0, 100);
    } else if (i == pointsCount - 1) {
      fill(200, 0, 0, 100);
    } else {
      fill(255, 255, 255);
    }
    strokeWeight(1);
    circle(points[i].x, points[i].y, r * 2);
    if (i > 0) {
      strokeWeight(5);
      line(
        points[i].stick.x1,
        points[i].stick.y1,
        points[i].stick.x2,
        points[i].stick.y2
      );
    }
  }
  fill(0, 0, 0);
  text(mouseX + ", " + mouseY, mouseX - 20, mouseY - 10);
}

function fabrik() {
  //Fix start and goal positions
  let n = pointsCount;
  let start = new point(points[0].x, points[0].y);
  let goal = new point(points[n - 1].x, points[n - 1].y);
  let d = diff(goal, start);
  let sumLen = 0;
  for (j = 1; j < n; j++) {
    sumLen += points[j].stick.m;
  }
  // #CHECK IF GOAL IS FURTHER THAN SUM OF LENGHTS#
  if (d.m - sumLen > 1) {
    //All sticks in a straight line.
    d = mult(d, 1 / d.m);
    for (j = 1; j < n; j++) {
      points[j].x = d.x2 * points[j].stick.m + points[j - 1].x;
      points[j].y = d.y2 * points[j].stick.m + points[j - 1].y;
      points[j].stick.update(points[j - 1], points[j]);
    }
  } else {
    let done = false;
    let counter = 0;
    while (!done) {
      //Move p_n-1 to goal, then begin reaching backwards:
      points[n - 1].x = goal.x;
      points[n - 1].y = goal.y;
      //  set i = n - 2.
      //  work out where p_i goes (vector stuff)
      //  i--; Repeat until i = 0;
      for (j = n - 2; j >= 0; j--) {
        d = diff(points[j], points[j + 1]);
        d = mult(d, points[j + 1].stick.m / d.m);
        points[j].x = d.x2 + points[j + 1].x;
        points[j].y = d.y2 + points[j + 1].y;
        points[j + 1].stick.update(points[j], points[j + 1]);
      }

      //Move p_0 to Start, begin reaching forwards:
      points[0].x = start.x;
      points[0].y = start.y;
      //  set i = 1.
      //  work out where p_i goes (vector stuff)
      //  i++; repeat until i = n-1;
      for (j = 1; j < n; j++) {
        d = diff(points[j], points[j - 1]);
        d = mult(d, points[j].stick.m / d.m);
        points[j].x = d.x2 + points[j - 1].x;
        points[j].y = d.y2 + points[j - 1].y;
        points[j].stick.update(points[j - 1], points[j]);
      }

      //Check if dist(goal, p_n-1) < margin:
      done =
        (dist(goal.x, goal.y, points[n - 1].x, points[n - 1].y) < 0.1 &&
          dist(start.x, start.y, points[0].x, points[0].y) < 0.1) ||
        counter++ > 2;
      //else: try again.
    }
  }
}

function magn(p1, p2) {
  return dist(p1.x, p1.y, p2.x, p2.y);
}

function diff(v, w) {
  if (v instanceof point) {
    return new Vector(0, 0, v.x - w.x, v.y - w.y);
  } else if (v instanceof Vector) {
    return new Vector(v.x1 - w.x1, v.y1 - w.y1, v.x2 - w.x2, v.y2 - w.y2);
  }
}
function add(v, w) {
  return new Vector(v.x1 + w.x1, v.y1 + w.y1, v.x2 + w.x2, v.y2 + w.y2);
}
function mult(v, m) {
  return new Vector(v.x1 * m, v.y1 * m, v.x2 * m, v.y2 * m);
}

function keyPressed() {
  // print(keyCode);
  if (keyCode == 13) {
    print("===========================");
    for (k = 1; k < pointsCount; k++) {
      print(
        k,
        "x1: " + round(points[k].stick.x1, 2),
        "y1: " + round(points[k].stick.y1, 2),
        "x2: " + round(points[k].stick.x2, 2),
        "y2: " + round(points[k].stick.y2, 2)
      );
    }
  } else if (keyCode == 32) {
    points[pointsCount++] = new point(mouseX, mouseY);
    if (pointsCount > 1) {
      points[pointsCount - 1].stick = new Stick(
        points[pointsCount - 2],
        points[pointsCount - 1]
      );
    }
  }
}

function mousePressed() {
  for (i = 0; i < pointsCount; i++) {
    points[i].isClicked(mouseX, mouseY);
  }
}

function mouseDragged() {
  for (i = 0; i < pointsCount; i++) {
    if (points[i].grabbed) {
      if (i == 0 && pointsCount > 1) {
        if (keyIsDown(17)) {
          points[1].stick.update(points[0], points[1]);
        } else {
          points[0].goto(mouseX, mouseY);
          fabrik();
          continue;
        }
      } else if (i != pointsCount - 1) {
        points[i].stick.update(points[i - 1], points[i]);
        points[i + 1].stick.update(points[i], points[i + 1]);
      } else {
        if (keyIsDown(17)) {
          points[pointsCount - 1].stick.update(
            points[pointsCount - 2],
            points[pointsCount - 1]
          );
        } else {
          points[i].goto(mouseX, mouseY);
          fabrik();
          continue;
        }
      }
      points[i].goto(mouseX, mouseY);
    }
  }
}

class Vector {
  constructor(x1, y1, x2 = 0, y2 = 0) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.m = dist(this.x1, this.y1, this.x2, this.y2);
  }

  update(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.m = dist(this.x1, this.y1, this.x2, this.y2);
  }
}

class point {
  constructor(mx, my) {
    this.x = mx;
    this.y = my;
    this.stick = null;
  }

  isClicked(mx, my) {
    let d = dist(this.x, this.y, mx, my);
    this.dx = this.x - mx;
    this.dy = this.y - my;
    this.grabbed = d < r;
  }

  goto(mx, my) {
    this.x = mx + this.dx;
    this.y = my + this.dy;
  }
}

class Stick extends Vector {
  constructor(p1, p2) {
    super(p1.x, p1.y, p2.x, p2.y);
    // this.x1 = p1.x;
    // this.y1 = p1.y;
    // this.x2 = p2.x;
    // this.y2 = p2.y;
    // this.m = dist(this.x1, this.y1, this.x2, this.y2);
  }

  update(p1, p2) {
    super.update(p1.x, p1.y, p2.x, p2.y);
  }
}
