"use strict";

let output="";
let runstat=0;
let dumpmax=1000;
let databuf=null;
let rpn=0;
let issysex=0;
let sysexbuf=[];

const sysexid={"40":"Kawai","41":"Roland","42":"Korg","43":"Yamaha","44":"Casio",
  "47":"Akai","52":"Zoom","7e":"UniversalNonRealTime","7f":"UniversalRealTime"
};

const sysextab=[
  {b:[0x7e, "dev", 0x09, 0x01, 0xf7], str:"GM1 System On"},
  {b:[0x7e, "dev", 0x09, 0x02, 0xf7], str:"GM System Off"},
  {b:[0x7e, "dev", 0x09, 0x03, 0xf7], str:"GM2 System On"},
  {b:[0x7f, "dev", 0x04,0x01, "{v1}",  "{v2}", 0xf7], str:"MasterVol {v1} {v2}"},
  {b:[0x7f, "dev", 0x04,0x02, "{v1}",  "{v2}", 0xf7], str:"MasterBalance {v1} {v2}"},
  {b:[0x7f, "dev", 0x04,0x03, "{v1}",  "{v2}", 0xf7], str:"MasterFineTune {v1} {v2}"},
  {b:[0x7f, "dev", 0x04,0x04, "{v1}",  "{v2}", 0xf7], str:"MasterCoarseTune {v1} {v2}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x00, 0x00, 0x7f, "{v1}", "sum", 0xf7], str:"GS SystemModeSet {v1}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x00, 0x01, "{v1}", "{v2}","sum", 0xf7], str:"GS ChMsgRxPort {v1} {v2}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x40, 0x00, 0x00, "{v1}", "{v2}", "{v3}", "{v4}", "sum",  0xf7], str:"GS MasterTune {v1} {v2} {v3} {v4}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x40, 0x00, 0x04, "{v1}", "sum", 0xf7], str:"GS Master Vol {v1}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x40, 0x00, 0x05, "{v1}", "sum", 0xf7], str:"GS Master KeyShift {v1}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x40, 0x00, 0x06, "{v1}", "sum", 0xf7], str:"GS Master Pan {v1}"},
  {b:[0x41, "dev", 0x42, 0x12, 0x40, 0x00, 0x7f, 0x00, 0x41, 0xf7], str:"GS Reset"},
  {b:[0x41, "dev", 0x42, 0x12,0x40,0x01,0x00,"","","","","","","","","","","","","","","","","sum",0xf7], str:"GS Patch Name"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x30,"{v}","sum", 0xf7], str:"GS ReverbMacro {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x31,"{v}","sum", 0xf7], str:"GS ReverbChar {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x32,"{v}","sum", 0xf7], str:"GS ReverbPreLPF {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x33,"{v}","sum", 0xf7], str:"GS ReverbLev {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x34,"{v}","sum", 0xf7], str:"GS ReverbTime {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x35,"{v}","sum", 0xf7], str:"GS ReverbFdbk {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x37,"{v}","sum", 0xf7], str:"GS ReverbPreDlyTime {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x38,"{v}","sum", 0xf7], str:"GS ChorusMacro {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x39,"{v}","sum", 0xf7], str:"GS ChorusPreLPF {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x3a,"{v}","sum", 0xf7], str:"GS ChorusLev {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x3b,"{v}","sum", 0xf7], str:"GS ChorusFdbk {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x3c,"{v}","sum", 0xf7], str:"GS ChorusDelay {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x3d,"{v}","sum", 0xf7], str:"GS ChorusRate {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x3e,"{v}","sum", 0xf7], str: "GS ChorusDepth {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x3f,"{v}","sum", 0xf7], str: "GS ChorusSendToRev {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x40,"{v}","sum", 0xf7], str: "GS ChorusSendToDelay {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x50,"{v}","sum", 0xf7], str: "GS DelayMacro {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x51,"{v}","sum", 0xf7], str: "GS DelayPreLPF {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x52,"{v}","sum", 0xf7], str: "GS DelayTimeCenter {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x53,"{v}","sum", 0xf7], str: "GS DelayTimeRatioL {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x54,"{v}","sum", 0xf7], str: "GS DelayTimeRatioR {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x55,"{v}","sum", 0xf7], str: "GS DelayLevCenter {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x56,"{v}","sum", 0xf7], str: "GS DelayLevL {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x57,"{v}","sum", 0xf7], str: "GS DelayLevR {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x58,"{v}","sum", 0xf7], str: "GS DelayLev {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x59,"{v}","sum", 0xf7], str: "GS DelayFdbk {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x01,0x5a,"{v}","sum", 0xf7], str: "GS DelaySendToRev {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x02,0x00,"{v}","sum", 0xf7], str: "GS EQLowFreq {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x02,0x01,"{v}","sum", 0xf7], str: "GS EQLowGain {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x02,0x02,"{v}","sum", 0xf7], str: "GS EQHighFreq {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,0x02,0x03,"{v}","sum", 0xf7], str: "GS EQHighGain {v}"},
  {b:[0x41, "dev", 0x42,0x12,0x40,  "{v1}",0x15,"{v2}","sum", 0xf7], str: "GS UseForRhythm {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x00,"{v1}","{v2}","{v3}","{v4}",0xf7], str:"XG MasterVol {v1} {v2} {v3} {v4}"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x04,"{v}",0xf7], str:"XG MasterVol {v}"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x05,"{v}",0xf7], str:"XG MasterAttenuator {v}"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x06,"{v}",0xf7], str:"XG Transpose {v}"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x7d,"{v}",0xf7], str:"XG Drum Setup {v}"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x7e,0x00,0xf7], str:"XG System On"},
  {b:[0x43, "dev", 0x4c,0x00,0x00,0x7f,0x00,0xf7], str:"XG AllParam Reset"},
  {b:[0x43, "dev", 0x4c,0x02,0x01,0x00,  "{v1}","{v2}",0xf7], str: "XG ReverbType {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x02,0x01,0x20,  "{v1}","{v2}",0xf7], str: "XG ChorusType {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x02,0x01,0x40,  "{v1}","{v2}",0xf7], str: "XG VariationType {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x02,0x40,0x00,  "{v1}",0xf7], str: "XG EQ Type {v1}"},
  {b:[0x43, "dev", 0x4c,0x03,0x00,0x00,  "{v1}","{v2}",0xf7], str: "XG InsertionEffect1Type {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x03,0x01,0x00,  "{v1}","{v2}",0xf7], str: "XG InsertionEffect2Type {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x03,0x02,0x00,  "{v1}","{v2}",0xf7], str: "XG InsertionEffect3Type {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x03,0x03,0x00,  "{v1}","{v2}",0xf7], str: "XG InsertionEffect4Type {v1} {v2}"},
  {b:[0x43, "dev", 0x4c,0x06,0x00,0x00],  str: "XG DisplayLetter"},
  {b:[0x43, "dev", 0x4c,0x07,0x00,0x00],  str: "XG DisplayData"},

];

function Clear(){
  console.log("clear")
  output="";
  window.scrollTo(0,0);
}
function WriteLine(line){
  output+=`<div>${line}</div>`;
}
function Get4u(data,offs){
  return (data[offs]<<24)+(data[offs+1]<<16)+(data[offs+2]<<8)+data[offs+3];
}
function Get3u(data,offs){
  return (data[offs]<<16)+(data[offs+1]<<8)+data[offs+2];
}
function Get2u(data,offs){
  return (data[offs]<<8)+data[offs+1];
}
function Get2d(data,offs){
  let d = Get2u(data,offs);
  if(d>=32768)
    d -= 65536;
  return d;
}
function Get1d(data,offs){
  let d=data[offs];
  if(d>=128)
    d-=256;
  return d;
}
function Get1h(data,offs){
  return ("00"+(data[offs].toString(16))).slice(-2);
}
function CheckBytes(data,offs,bytes){
  const o={};
  for(let i=0;i<bytes.length;++i){
    if(typeof(bytes[i])=="string"){
      if(bytes[i].length>0)
        o[bytes[i]]=data[offs+i];
      continue;
    }
    if(bytes[i]>=0 && data[offs+i]!=bytes[i])
      return null;
  }
  return o;
}
function GetSysExStr(){
  let str="";
  let o=null;
  for(let i=0; i<sysextab.length; ++i){
    const t=sysextab[i];
    str=t.str;
    o=CheckBytes(sysexbuf,0,t.b);
    if(o){
      str=t.str;
      console.log(o)
      for(let k in o){
        str=str.replace(k,o[k]);
      }
      return `"${str}"`;
    }
  }
  return "";
}
function Get4s(data,offs){
  return GetStr(data,offs,4)[0];
}
function ChStr(x){
  return ("ch:"+((x&0xf)+1)+"  ").slice(0,5);
}
function CCStr(x){
  return ("CC#"+(x)+"   ").slice(0,6);
}
function GetStr(data,offs,len){
  let array=data.slice(offs,offs+len);
  let l=array.indexOf(0);
  if(l>0)
    array=array.slice(0,l);
  let s=Encoding.convert(array,{to:"UNICODE",from:"AUTO",type:"string"});
  s=s.replace(/&/g,"&amp;").replace(/"/g,"&quot").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"\\n");
  return [s];
}
function ToHex(data,n){
  return ("000000"+data.toString(16)).slice(-n);
}
function Delta(data,offs){
  let delta=0;
  let offs0=offs;
  while((data[offs]&0x80)==0x80){
    delta=(delta<<7)|(data[offs]&0x7f);
    ++offs;
  }
  delta|=data[offs]&0x7f;
  ++offs;
  return {val:delta,size:offs-offs0};
}
function DumpBytes(data,offs,n){
  let str=[""];
  let line=0;
  let i;
  while(n>8){
    str[line]+=`<span class="adr">${ToHex(offs,6)}</span> `;
    for(i=0;i<8;++i){
      str[line]+=ToHex(data[offs+i],2)+" ";
    }
    n-=8;
    offs+=8;
    str[++line]="";
  }
  str[line]+=`<span class="adr">${ToHex(offs,6)}</span> `;
  for(i=0;i<n;++i){
    str[line]+=ToHex(data[offs+i],2)+" ";
  }
  while(i<8){
    str[line]+="   ";
    ++i;
  }
  return str;
}
function Line(data,offs,size,val){
  const b=DumpBytes(data,offs,size);
  let i;
  for(i=0;i<b.length-1;++i)
    WriteLine(b[i]);
  WriteLine(`${b[i]} ${val}`);
}
function MThd(data,offs){
  Line(data,offs,2, `Format (${Get2u(data,offs)})`);
  offs+=2;
  Line(data,offs,2, `NumberOfTracks (${Get2u(data,offs)})`);
  offs+=2;
  Line(data,offs,2, `TimeBase (${Get2d(data,offs)})`);
  offs+=2;
  return offs;
}
function MetaEvent(data,offs){
  let delta=Delta(data,offs+2);
  let len=2+delta.size+delta.val;
  switch(data[offs+1]){
  case 0:
    return {val:`Meta:Sequence (${Get2u(data,offs+2)})`, size:len};
  case 1:
    return {val:`Meta:Text <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 2:
    return {val:`Meta:Copyright <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 3:
    return {val:`Meta:TrackName <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 4:
    return {val:`Meta:Instrument <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 5:
    return {val:`Meta:Lyric <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 6:
    return {val:`Meta:Marker <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 7:
    return {val:`Meta:CuePoint <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`,size:len};
  case 8:
  case 9:
  case 0xa:
  case 0xb:
  case 0xc:
  case 0xd:
  case 0xe:
  case 0xf:
    return {val:`Meta:Unknown <div class="param2">"${GetStr(data,offs+2+delta.size,delta.val)[0]}"</div>`, size:len};
  case 0x20:
    return {val:`Meta:ChannelPrefix`,size:len};
  case 0x21:
    return {val:`Meta:PortPrefix`,size:len};
  case 0x2f:
    return {val:"Meta:EndOfTrack", size:len, eot:true};
  case 0x51: {
    const t=Get3u(data,offs+3);
    return {val:`Meta:SetTempo (${t} = ${60/(t*0.000001)})`, size:len};
    }
  case 0x54:
    return {val:"Meta:SMPTEOffset", size:len};
  case 0x58:
    return {val:`Meta:TimeSig (${data[offs+3]}/${1<<data[offs+4]}, Metronome=${data[offs+5]}MIDICLK, ${data[offs+6]}/32=24MIDICLK)`, size:len};
  case 0x59: {
      const n=Get1d(data,offs+3);
      const keys=[
        ["Cb Maj","Gb Maj","Db Maj","Ab Maj","Eb Maj","Bb Maj","F Maj","C Maj","G Maj","D Maj","A Maj","E Maj","B Maj","F# Maj","C# Maj"],
        ["Ab min","Eb min","Bb min","F min","C min","G min","D min","A min","E min","B min","F# min","C# min","G# min","D# min","A# min"]
      ]
      return {val:`Meta:KeySig (${n} ${["major","minor"][data[offs+4]&1]} = "${keys[data[offs+4]&1][n+7]}")`, size:len};
    }
  case 0x7f:
    return {val:"Meta:SeqSpecific",size:len};
  }
}
function RpnName(x){
  switch(x){
  case 0: return "BendSens";
  case 1: return "FineTune";
  case 2: return "CoarseTune";
  case 0x7f7f: return "Null";
  }
  return "";
}
function CcName(cc){
  const cctab=[
    "BankSel",      "Modulat",      "BreathC",      "       ",      //0
    "FootCtl",      "PortaTm",      "DataEnt",      "ChVolum",
    "Balance",      "       ",      "Pan    ",      "Express",
    "Effect1",      "Effect2",      "       ",      "       ",
    "GenPur1",      "GenPur2",      "GenPur3",      "GenPur4",      //16
    "       ",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",
    "BankLSB",      "ModuLSB",      "BrthLSB",      "       ",      //32
    "FootLSB",      "PortLSB",      "DEntLSB",      "ChVoLSB",
    "BalaLSB",      "       ",      "PanLSB ",      "ExprLSB",
    "Eff1LSB",      "Eff2LSB",      "       ",      "       ",
    "GeP1LSB",      "GeP2LSB",      "GeP3LSB",      "GeP4LSB",      //48
    "       ",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",
    "Sustain",      "Porta  ",      "Sostenu",      "SoftPed",      //64
    "Legato ",      "Hold2  ",      "SndCtl1",      "SndCtl2",
    "SndCtl3",      "SndCtl4",      "SndCtl5",      "SndCtl6",
    "SndCtl7",      "SndCtl8",      "SndCtl9",      "SndCt10",
    "GenPur5",      "GenPur6",      "GenPur7",      "GenPur8",      //80
    "PortaCt",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "Eff1Dep",
    "Eff2Dep",      "Eff3Dep",      "Eff4Dep",      "Eff5Dep",
    "DataInc",      "DataDec",      "NRPNLSB",      "NPRNMSB",      //96
    "RPNLSB ",      "RPNMSB ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",
    "       ",      "       ",      "       ",      "       ",      //112
    "       ",      "       ",      "       ",      "       ",
    "AllSndOff",    "RstALlCtl",    "LocalCtl",     "AllNoteOff",   //120
    "OmniOff",      "OmniOn ",      "MonoMode",     "PolyMode",
  ];
  return cctab[cc];
}
function ChVoice(stat,b1,b2){
  switch(stat&0xf0){
  case 0x80:
    return {val:`NoteOff (${ChStr(stat)} note:${b1} velo:${b2})`,size:3,class:"Off"};
  case 0x90:
    return {val:`NoteOn  (${ChStr(stat)} note:${b1} velo:${b2})`,size:3,class:(b2==0?"Off":"On")};
  case 0xa0:
    return {val:`PolyPres (${ChStr(stat)} note:${b1} val:${b2})`,size:3,class:"Other"};
  case 0xb0:
    if(b1==100)
      rpn=(rpn&0xff00)|b2;
    if(b1==101)
      rpn=(rpn&0x7f)|(b2<<8);
    if(b1==6||b1==38||b1==96||b1==97)
      return {val:`CtrlChg (${ChStr(stat)} ${CCStr(b1)}(${CcName(b1)}:${RpnName(rpn)}) val:${b2})`,size:3,class:"Ctl"};
    else
      return {val:`CtrlChg (${ChStr(stat)} ${CCStr(b1)}(${CcName(b1)}) val:${b2})`,size:3,class:"Ctl"};
  case 0xc0:
    return {val:`ProgChg (${ChStr(stat)} pg:${b1})`,size:2,class:"Prog"};
  case 0xd0:
    return {val:`ChPres (${ChStr(stat)} val:${b1})`,size:2,class:"Other"};
  case 0xe0:
    return {val:`PitchBend (${ChStr(stat)} val:${b1+(b2<<7)-8192})`,size:3,class:"Other"};
  }
}
function SysEx(data,offs){
  const len=Delta(data,offs+1);
  if(issysex){
    sysexbuf=sysexbuf.concat(Array.from(data.slice(offs+len.size+1,offs+len.size+1+len.val)));
    if(sysexbuf.indexOf(0xf7)){
      let id="";
      let dev=0;
      if(sysexbuf[0]!=0)
        id=("00"+sysexbuf[0].toString(16)).slice(-2),dev=("00"+sysexbuf[1].toString(16)).slice(-2);
      else
        id="00"+("00"+sysexbuf[1].toString(16)).slice(-2)+("00"+sysexbuf[2].toString(16)).slice(-2),dev=("00"+sysexbuf[3].toString(16)).slice(-2);
      issysex=0;
      return {val:`SysEx len=${len.val} id="${sysexid[id]}" dev=${dev}H ${GetSysExStr()}`, size:len.size+len.val+1};
    }
    else{
      return {val:`SysEx len=${len.val} "Multi-Packet SysEx"`, size:len.size+len.val+1};
    }
  }
  else
    return {val:`SysEx len=${len.val},"Escape"`, size:len.size+len.val+1};
}
function MidiEvent(data,offs,runstat){
  let o;
  if(data[offs]==0xf0){
    sysexbuf=[];
    issysex=1;
    o=SysEx(data,offs);
    return o;
  }
  if(data[offs]==0xf7){
    o=SysEx(data,offs);
    return o;
  }
  if(data[offs]==0xff){
    runstat=0;
    issysex=0;
    o=MetaEvent(data,offs);
    return {val:o.val, size:o.size, class:"meta",eot:o.eot};
  }
  if(data[offs]<0x80){
    if(runstat>=0x80&&runstat<0xf0){
      o=ChVoice(runstat,data[offs],data[offs+1]);
      o={val:`${o.val}(RunStat)`, size:o.size-1, class:o.class};
    }
    else{
      let j=0;
      for(;data[offs+j]<0x80;++j)
        ;
      o={val:"Running Status Error", size:j};
    }
  }
  else{
    o=ChVoice(data[offs],data[offs+1],data[offs+2]);
  }
  return o;
}
function MTrk(data,offs,eoc){
  runstat=0;
  let tick=0;

  WriteLine(`                                 <span class="delta">delta :   tick :</span>`);

  for(let i=0;;++i){
    if(offs>=dumpmax)
      return offs;
    const offs0=offs;
    const delta=Delta(data,offs);
    offs+=delta.size;
    const ev=MidiEvent(data,offs,runstat);
    if(data[offs]>0x80&&data[offs]<0xf0)
      runstat=data[offs];
    const d=("     +"+delta.val).slice(-6);
    tick+=delta.val;
    Line(data,offs0,delta.size+ev.size, `<span class="delta">${d} = ${("     "+tick).slice(-6)} : </span> <span class="${ev.class}">${ev.val}</span>`);
    offs+=ev.size;
    if(ev.eot){
      if(offs<eoc)
        Line(data,offs,eoc-offs,"Extra Data after EndOfTrack");
      return offs;
    }
    if(offs>=eoc){
      Line(data,offs,0,"EndOfTrack Not Found");
      console.log("EndOfTrack Not Found");
      return offs;
    }
  }
}
function Chunk(buf,offs){
  const type=Get4s(buf,offs);
  const length=Get4u(buf,offs+4);
  const eoc=offs+8+length;
  Line(buf,offs,4, `<span class="Chunk">Chunk ("${type}")</span>`);
  Line(buf,offs+4,4,`<span class="Chunk">length (${length})</span>`);
  offs+=8;
  switch(type){
  case "MThd": offs=MThd(buf,offs); break;
  case "MTrk": offs=MTrk(buf,offs,eoc); break;
  case "XFIH": offs=MTrk(buf,offs,eoc); break;
  case "XFKM": offs=MTrk(buf,offs,eoc); break;
  }
  if(offs>=dumpmax)
    return;
  if(offs!=eoc){
    WriteLine("End of Chunk not match..");
  }
  return eoc;
}
function DumpAll(){
  console.log("DumpAll")
  if(databuf){
    dumpmax=1000000;
    Dump(databuf);
    document.getElementById("dumpall").style.display="none";
  }
}
function Dump(buf){
  console.log("Dump");
  Clear();
  let offs=0;
  while(offs<buf.length){
    offs=Chunk(buf,offs);
    WriteLine("");
    if(offs>=dumpmax)
      break;
  }
  if(dumpmax==1000){
    WriteLine("...and more...");
    document.getElementById("text").innerHTML=output;
    document.getElementById("dumpall").style.display="block";
  }
  else {
    document.getElementById("text").innerHTML=output;
    document.getElementById("dumpall").style.display="none";
  }
}
function DragLeave(){
  document.body.style.background="#234";
}
function DragOver(ev){
  ev.stopPropagation();
  ev.preventDefault();
  ev.dataTransfer.dropEffect = 'copy';
  document.body.style.background="#456";
}
function Drop(ev){
  console.log("drop");
  document.getElementById("file").value="";
  Clear();
  ev.stopPropagation();
  ev.preventDefault();
  const files = ev.dataTransfer.files; 
  const file=files[0];
  document.body.style.background="#234";
  document.getElementById("filename").innerText=file.name;
  const reader=new FileReader();
  reader.onload=()=>{
    databuf=new Uint8Array(reader.result);
    dumpmax=1000;
    Dump(databuf);
  };
  reader.readAsArrayBuffer(files[0]);
}
function SelectFile(ev){
  const file=ev.target.files[0];
  if(file){
    document.getElementById("file").value="";
    document.getElementById("filename").innerText=file.name;
    const reader=new FileReader();
    reader.onload=()=>{
      databuf=new Uint8Array(reader.result);
      dumpmax=1000;
      Dump(databuf);
    };
    reader.readAsArrayBuffer(file);
  }
}
function Init(){
  const file=document.getElementById("file");
  const body=document.body;
  file.addEventListener("change", SelectFile);
  body.addEventListener("dragover", DragOver);
  body.addEventListener("dragleave",DragLeave);
  body.addEventListener("drop", Drop);
  window.scrollTo(0,0);
}

window.onload=Init;
DumpAll();