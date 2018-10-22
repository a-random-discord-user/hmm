const express = require('express');

const router = express.Router();
router.get('/', (req, res) => {
		let themes;
		if(req.cookies){
			themes = req.cookies["theme"] == 1 ? 1 : 0;
		}else{
			themes = 0;
		}
		res.render('tos', {
			title: 'tos',
			theme: themes
		});
})

module.exports = router;