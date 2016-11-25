{
  function catChoice(list) {
    if (list[list.length - 1] === null) return list.slice(0, -1);
    else return list;
  }
  function parsePara(string) {
    var array = string.split("\n"),
        spaces = [];
    if (array[0] === "") array = array.slice(1, array.length - 1);
    for (var a = 0; a < array.length; a++) {
      spaces.push(0);
      for (var b = 0; b < array[a].length; b++) {
        if (array[a][b] === " ") spaces[a] += 1;
        else break;
      }
    }
    spaces = spaces.sort(function(a, b){return a-b});
    for (var c = 0; c < array.length; c++) {
      array[c] = array[c].slice(spaces[0]);
    }
    return array.join("\n");
  }
}
Program = style:(style:Style Newline {return style})?
          chars:(chars:(Header / Div / Paragraph) Newline* {return chars})+
          {
            if (style === null) return [chars];
            else return [style, chars];
          }
Style = ("style (" Newline
        uses:(" "* name:Word " uses (" Newline
              style:(" "* ref:Word " " id:([^ \r\n\t])+
                     Newline {return [ref, id.join("")]})+
              " "* ")" Newline {return [name, style]})+
        ")" {return ["Style", uses]})
Div = "section " cat:(cat:Category " " {return cat})? "(" Newline
      indiv:(" "* inst:Instruction Newline {return inst})* " "* ")"
      {return catChoice(["div", indiv, cat])}
Instruction = Header / Paragraph / Insert / Div / Link
Insert = "insert " name:Word {return ["Insert", name]}
Paragraph = "text " cat:(cat:Category " " {return cat})? inpara:(String / SingleLineStr)
            {return catChoice(["p", parsePara(inpara), cat])}
Header = "header " head:Number " " cat:(cat:Category " " {return cat})?
         inhead:SingleLineStr {return catChoice(["h", head, inhead, cat])}
Link = "link " link:SingleLineStr " " cat:(cat:Category " " {return cat})?
       text:String {return catChoice(["a", link, text, cat])}
Category = (cls:Class {return ["class", cls]} /
            id:ID " " cls:Class {return ["both", id, cls]} /
            id:ID {return ["id", id]})
ID = Word
Class = "in " cls:Word {return cls}
SingleLineStr = "\"" str:[^"\n]+ "\"" {return str.join("")} /
                "'" str:[^'\n]+ "'" {return str.join("")}
String = "\"" str:[^"]+ "\"" {return str.join("")} /
         "'" str:[^']+ "'" {return str.join("")}
Word = word:[A-Za-z_]+ {return word.join("")}
Number = num:[0-9]+ {return parseInt(num.join(""))}
Newline = "\r\n" / "\n"
