/*
 * PapyrusTable.js
 * 
 * Elisabeth Gueux, Salome Mialon, Quentin Piet, Axel Polin
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301, USA.
 * 
 * Please visit : https://github.com/axel-polin/Papyrus_UI
 * 
 */

/* This file contain the table of all papyrus in the server.
*/

/* Table syntax : one element per line;
 * 
 * Element syntax : 
 * 	Ref : the reference of the file (or id);
 * 	THB : the id of the thumbnail of the papyrus;
 * 	RCL : relative path to recto color papyrus image;
 * 	VCL : relative path to verso color papyrus image;
 * 	RIR : relative path to recto infrared papyrus image;
 * 	VIR : relative path to verso infrared papyrus image;
 * 	MetaDatas : relative path to metadatas.
 */
 
var PapyrusTable = [
  {"Ref" : "1242", "THB": "1242_thb", "RCL" : "fake_data/1242_r_CL.JPG","VCL" : "fake_data/1242_v_CL.JPG","RIR" : "fake_data/1242_r_IR.JPG","VIR" : "fake_data/1242_v_IR.JPG","MetaDatas" : "fake_data/1242.xml" },
  {"Ref" : "88a", "THB": "88a_thb", "RCL" : "fake_data/88_a_r_CL.JPG ","VCL" : "fake_data/88_a_v_CL.JPG","RIR" : "fake_data/88_a_r_IR.JPG","VIR" : "fake_data/88_a_v_IR.JPG","MetaDatas" : "fake_data/0088a.xml" },
  {"Ref" : "2733o", "THB": "2733o_thb", "RCL" : "fake_data/2733_o_r_CL.JPG","VCL" : "fake_data/2733_o_v_CL.JPG","RIR" : "fake_data/2733_o_r_IR.JPG","VIR" : "fake_data/2733_o_v_IR.JPG","MetaDatas" : "fake_data/2733a.xml" },
  {"Ref" : "1319", "THB": "1319_thb", "RCL" : "fake_data/1319_r_CL.JPG","VCL" : "fake_data/1319_v_CL.JPG","RIR" : "fake_data/1319_r_IR.JPG","VIR" : "fake_data/1319_v_IR.JPG","MetaDatas" : "fake_data/1319.xml" },
  {"Ref" : "563k", "THB": "563k_thb", "RCL" : "fake_data/563_567_k_r_CL.JPG","VCL" : "fake_data/563_567_k_v_CL.JPG","RIR" : "fake_data/563_567_k_r_IR.JPG","VIR" : "fake_data/563_567_k_v_IR.JPG","MetaDatas" : "fake_data/0563k.xml" },
];
