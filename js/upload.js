document.getElementById("file").addEventListener("change", function(e) {
	e.preventDefault();
	
	var elem = this;
	
	var files = e.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var r = new FileReader();
    r.onload = function() {
        var Uints = new Uint8Array(r.result);
        var db = new SQL.Database(Uints);
		
		var event = new CustomEvent("dbloaded", {detail: db});
		
		elem.dispatchEvent(event);
    };
	
    r.readAsArrayBuffer(files[0]);
});