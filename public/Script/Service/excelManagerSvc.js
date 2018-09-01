var app = angular.module('myApp');

app.service('excelManagerSvc', ['common', function(common) {
 	
 	var excel = {};

 	function datenum(v, date1904) {
		if(date1904) v+=1462;
		var epoch = Date.parse(v);
		return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
	}
	 
	function sheet_from_array_of_arrays(data, opts) {
		var ws = {};
		var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
		for(var R = 0; R != data.length; ++R) {
			for(var C = 0; C != data[R].length; ++C) {
				if(range.s.r > R) range.s.r = R;
				if(range.s.c > C) range.s.c = C;
				if(range.e.r < R) range.e.r = R;
				if(range.e.c < C) range.e.c = C;
				var cell = {v: data[R][C] };
				if(cell.v == null) continue;
				var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
				
				if(typeof cell.v === 'number') cell.t = 'n';
				else if(typeof cell.v === 'boolean') cell.t = 'b';
				else if(cell.v instanceof Date) {
					cell.t = 'n'; cell.z = XLSX.SSF._table[14];
					cell.v = datenum(cell.v);
				}
				else cell.t = 's';
				
				cell.s = {
					fill: {
						bgColor: { rgb: "FFFFAA00" }
					} 
				}
				ws[cell_ref] = cell;
			}
		}
		if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
		return ws;
	}
	 
	function Workbook() {
		if(!(this instanceof Workbook)) return new Workbook();
		this.SheetNames = [];
		this.Sheets = {};
	}

	function s2ab(s) {
		var buf = new ArrayBuffer(s.length);
		var view = new Uint8Array(buf);
		for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
		return buf;
	}

 	excel.exporter = function(donnees){
		var dataTitle = [
			"Num\351ro de certificat",
            "Nom/Pr\351nom",
			"Email",
			"Adresse",
			"Ville de r\351sidence",
			"T\351l\351phone",
            "Date d'achat",
			"Info-lettre"
		];

		donnees = donnees.filter(function(d){
			if(!d.delete){
				return d;
			}
		});

		var data = donnees.map(function(forfait){
		 	var dataTemp = [
					forfait.noCommande,
					common.capitalize(forfait.nom) + " " + common.capitalize(forfait.prenom),
					forfait.email, 
					forfait.adresse,
					common.capitalize(forfait.ville),
					forfait.telephone,
					moment(forfait.dateAchat).format("YYYY-MM-DD"),
					forfait.infoLettre ? "Oui" : "Non"
				];
				return dataTemp;
		});
		data.splice(0, 0, dataTitle);

		//console.log(data);
		var ws_name = "Fiche client";

		var wb = new Workbook();
		var ws = sheet_from_array_of_arrays(data);
	 
		/* add worksheet to workbook */
		wb.SheetNames.push(ws_name);
		wb.Sheets[ws_name] = ws;

		var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

		saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), "Fiches_clients_"+ new Date().toLocaleDateString() + ".xlsx")
     }

 	return excel;
 }]);

