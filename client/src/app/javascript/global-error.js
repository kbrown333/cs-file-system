window.onerror = function(err, url, line) {
	$.ajax({
		url: '/api/errors/write',
		type: 'POST',
		data: {msg: err, url: url, line: line},
		success: function(rslt) {
			console.log('Error message transmitted');
		},
		error: function(error) {
			console.warn(error);
		}
	});
}
