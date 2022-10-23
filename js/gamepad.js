
const gamepadPolling = (sendGamepadData) => {

  let linear = {'x': 0.0, 'y': 0.0, 'z': 0.0};
  let angular = {'x': 0.0, 'y': 0.0, 'z': 0.0};
  let turbo = 0.4;//0.70;
  let snail = 0.45;//0.65;
  let punytoo = 0.7;//1.0;
  let linearxbias = 0.00; // was 0.032
  let ga1floatval = 0.05;
  let angularzbias = 0.0;
  var zerosent = 0;

  let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);

 if(!gamepads)
    return;
 let gp = gamepads[0];

  if(!gp) {
    setTimeout(() => { gamepadPolling(sendGamepadData) }, 100);
    return;
  }

/*	  
  if(gp.buttons[5].pressed) {
    turbo = 0.8
  }
  if(gp.buttons[4].pressed) {
    snail = 0.15;
  }
  else if(gp.buttons[5].pressed) {
    turbo = 1.3;  //changed 1.00 //was 1.2
  }

  if(gp.buttons[6].pressed) {
    snail = 0.24; //changed 0.45 //was 0.3
  }
  else if(gp.buttons[7].pressed) {
    turbo = 2.0; //changed 1.25 //was 1.2
  }

*/

  //turbo = 0.5;
  if(gp.buttons[5].pressed) {
    turbo = 0.8;
  }


  if((gp.axes[1] != 0) || (gp.axes[2] != 0)) {
    //linear.x = snail*turbo*gp.axes[1]*(-1)+linearxbias;
    linear.x = gp.axes[1]*(-1)*turbo;

    if(gp.axes[1] >= ga1floatval) {
      //angular.z = (gp.axes[2]*punytoo*0.5-angularzbias)*0.8;    // was 0.7
      angular.z = gp.axes[2]*(-1)*0.6;
    }

    if(gp.axes[1] <= -ga1floatval) {
      //angular.z = (gp.axes[2]*(-1)*punytoo*0.5+angularzbias)*0.8;   // was 0.7
      angular.z = gp.axes[2]*(-1)*0.6;
    }


    if ((gp.axes[1] < ga1floatval) && (gp.axes[1] > -ga1floatval)) {
      linear.x = 0;
      angular.z = 0;
    }

    //spw.send(btwist);
    //console.log(linear, angular);

  }
  else if((gp.axes[1] == 0) && (gp.axes[2] == 0) && (zerosent==0)) {

    linear.x = 0;
    angular.z = 0;

    zerosent = 1;
  }

  let data = {'angular': angular, 'linear': linear};
  //console.log(data);
  sendGamepadData(data);
  setTimeout(() => { gamepadPolling(sendGamepadData) }, 100);
};



