const express = require('express');
const user = require('./user');
const db = require('../db');
const os = require('os');
const router = express.Router();
let test;
		function cpu1(){
	 var cpus = os.cpus();
        var cpu = cpus[0], total = 0;

        for(var type in cpu.times) {
            total += cpu.times[type];
        }
       return val1 = (Math.round(100 * cpu.times.user / total));
	}
		function cpu2(){
	 var cpus = os.cpus();
        var cpu = cpus[1], total = 0;

        for(var type in cpu.times) {
            total += cpu.times[type];
        }
       return val2 = (Math.round(100 * cpu.times.user / total));
	}
ram = Math.round(Math.ceil((os.totalmem() - os.freemem()) / 1000000) /  (os.totalmem() / 1000000)*100);
ramtotal = Math.round(Math.ceil((os.totalmem() - os.freemem()) / 1000000));
ramuse = Math.round(Math.ceil(process.memoryUsage().heapTotal / 1000000));
router.get('/',user.admin, (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.render('stats', {
			title: 'stats',
			ram: ram,
			ramtotal: ramtotal,
			ramuse: ramuse,
			cpuuse1: cpu1(),
			cpuuse2: cpu2(),
			theme: themes

		});
})

module.exports = router;