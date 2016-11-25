var cbs = require("./parse_cbs");
var fs = require("fs");

module.exports = {
  parse_cbs: function(file_in) {
    var filename = file_in[2];
    var folder = filename.split("/")[0] + "/";
    var final = cbs.parse(fs.readFileSync(filename).toString());

    var dict_names_get = (fs.readFileSync("txt/dict_names.txt").toString()).split("\n");
    dict_names_get = dict_names_get.slice(0, dict_names_get.length - 1);
    var dict_names = {};
    for (var c = 0; c < dict_names_get.length; c++) {
      var temp = dict_names_get[c].split(":");
      dict_names[temp[0]] = temp[1];
    }

    var dict_styles_get = (fs.readFileSync("txt/dict_styles.txt").toString()).split("\n");
    dict_styles_get = dict_styles_get.slice(0, dict_styles_get.length - 1);
    var dict_styles = {};
    for (var d = 0; d < dict_styles_get.length; d++) {
      var temp = dict_styles_get[d].split(":");
      dict_styles[temp[0]] = temp[1];
    }

    var out_html, out_css;

    function process_div(list, indent) {
      var final_code = [],
          final_indent = [];
      for (var g = 0; g < indent; g++) {
        final_indent.push("  ");
      }
      final_indent = final_indent.join("");
      for (var f = 0; f < list[0].length; f++) {
        var category = list[0][f][list[0][f].length - 1];
        if (typeof(category) !== "object") {
          var final_cat = "";
        } else if (category.length === 3) {
          var final_cat = " id='" + category[1] + "' class='" + category[2] + "'";
        } else {
          var final_cat = " " + category[0] + "='" + category[1] + "'";
        }
        if (list[0][f][0] === "h") {
          var header = "<h" + list[0][f][1].toString() + final_cat + ">";
          var info_head = list[0][f][2];
          var close_head = "</" + list[0][f][0] + list[0][f][1].toString() + ">";
          header = header + info_head + close_head;
          final_code.push(final_indent + header);
        } else if (list[0][f][0] === "p") {
          var para = "<p" + final_cat + ">";
          para = para + list[0][f][1] + "</p>";
          final_code.push(final_indent + para);
        } else if (list[0][f][0] === "a") {
          var link = "<a" + final_cat + " href='" + list[0][f][1] + "'>";
          link = link + list[0][f][2] + "</a>";
          final_code.push(final_indent + link);
        } else if (list[0][f][0] === "div") {
          var div = "<div" + final_cat + ">";
          final_code.push(final_indent + div);
          final_code.push(process_div(list[0][f].slice(1, list[0][f].length), indent + 1));
          final_code.push(final_indent + "</div>");
        }
      }
      return final_code.join("\n");
    }

    if (final[0][0] === "Style") {
      var style = final[0][1],
          html = final[1],
          out_css = [];
      for (var a = 0; a < style.length; a++) {
        var current_style = [];
        for (var b = 0; b < style[a][1].length; b++) {
          var condensed = style[a][1][b];
          if (condensed[0] in dict_styles) var temp = dict_styles[condensed[0]];
          else var temp = condensed[0];
          current_style.push(temp + ": " + condensed[1] + ";");
        }
        if (style[a][0] in dict_names) var temp = dict_names[style[a][0]];
        else var temp = style[a][0];
        out_css.push(temp + " {\n  " + current_style.join("\n  ") + "\n}");
      }
      out_css = out_css.join("\n");
      fs.writeFileSync(folder + "styles.css", out_css);
    } else {
      var style,
          html = final[0];
    }

    var out_html = "<!DOCTYPE html>\n" +
                   "<html>"
                   "<head>\n" +
                   "  <link rel='stylesheet' href='styles.css'>\n" +
                   "</head>\n" +
                   "<body>\n" +
                   process_div([html], 1) + "\n" +
                   "</body\n>" +
                   "</html>";
    console.log(out_html);
    fs.writeFileSync(filename.split(".")[0] + ".html", out_html);
  }
}
