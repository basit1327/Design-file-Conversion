'use strict';

const
	express = require('express'),
	dwgConversionService = require('../../services/dwg');

let router = express.Router();

router.post('/toDxf', dwgConversionService.convertDwgToDxf);

module.exports = router;
