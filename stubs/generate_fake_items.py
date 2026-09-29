# Regenerates stubs/foundyou-fake-items.json. Run from the repo root:
#   python3 stubs/generate_fake_items.py
import json
CAT = {"earbuds":"electronics","headphones":"electronics","phone":"electronics","laptop":"electronics","tablet":"electronics","charger":"electronics","calculator":"electronics",
"jacket":"clothing","sweater_or_hoodie":"clothing","hat":"clothing","scarf":"clothing","gloves":"clothing",
"backpack":"bags","tote_bag":"bags","purse_or_wallet":"bags",
"watch":"accessories","glasses":"accessories","sunglasses":"accessories","jewelry":"accessories","umbrella":"accessories",
"keys":"accessories","id_card":"cards_and_id","notebook":"books_and_stationery","textbook":"books_and_stationery",
"water_bottle":"water_bottles_and_drinkware","other":"other"}
W="Woodruff Library";S="Emory Student Center";D="DCT";C="Cox Hall";P="WoodPEC"
SC="Science buildings (MSC, Atwood, PAIS)";H="Humanities buildings (Callaway, White Hall, Candler Library)"
G="Goizueta Business School";R="Rollins School of Public Health"
RH="Residence halls (Raoul, Hamilton, Turman, Dobbs, Alabama, Clifton Towers, Woodies, Complex, Harris Hall)"
Q="The Quad";M="McDonough Field";CS="Cliff Shuttle / Asbury Circle";PD="Parking decks";O="Other / not sure"
# type, colors, brand, description, area, detail, day, hh:mm, status, text
rows=[
("earbuds",["white"],"Apple","White earbuds case with a star sticker",W,"2nd floor",27,"14:30","available",""),
("earbuds",["black"],"Apple","Black earbuds case",W,"1st floor",27,"14:15","available",""),
("earbuds",["white"],"Samsung","White earbuds case",S,"Food court",27,"16:10","available",""),
("earbuds",["white"],"Apple","White earbuds case",D,None,26,"15:20","available",""),
("earbuds",["blue"],"Sony","Blue earbuds in a small case",C,"Near the entrance",25,"13:05","available",""),
("earbuds",["white"],"Apple","White earbuds case",W,"Main floor",26,"15:40","resolved",""),
("earbuds",["white"],"Apple","White earbuds case",W,"3rd floor",20,"12:00","available",""),
("laptop",["silver"],"Apple","Silver MacBook laptop",W,"2nd floor",27,"15:00","available",""),
("backpack",["black"],"Jansport","Black backpack",W,"Study room",28,"13:45","available",""),
("backpack",["black"],"The North Face","Black backpack with a front zip pocket",S,"Near the stairs",27,"13:30","available",""),
("backpack",["black"],None,"Black backpack",D,"Lobby",26,"12:25","available",""),
("backpack",["black"],"Nike","Black backpack with a white logo",C,None,25,"14:50","available",""),
("backpack",["black"],"Patagonia","Black backpack",P,"Front desk",24,"17:10","available",""),
("backpack",["black"],"Herschel","Black backpack",Q,"Near the benches",23,"15:00","available",""),
("backpack",["black"],"Osprey","Black hiking backpack",G,"Lobby",22,"14:20","available",""),
("backpack",["black"],"Under Armour","Black backpack",PD,"Level 2",21,"16:45","available",""),
("water_bottle",["black"],"Hydro Flask","Black insulated water bottle",W,"1st floor",28,"15:35","available",""),
("water_bottle",["black"],"Stanley","Black insulated water bottle with a handle",S,"Table near the windows",27,"12:40","available","M. OKAFOR"),
("water_bottle",["black"],None,"Black plastic water bottle",P,"Locker room",26,"18:00","available",""),
("water_bottle",["blue"],"Nalgene","Blue water bottle with stickers",D,"Second floor",25,"14:50","available",""),
("jacket",["black"],"The North Face","Black zip-up jacket",W,"Coat rack",28,"13:15","available",""),
("jacket",["black"],"Patagonia","Black fleece jacket",C,"Table by the windows",26,"14:05","available",""),
("jacket",["black"],None,"Black rain jacket",Q,None,24,"15:30","available",""),
("phone",["black"],"Apple","Black phone in a clear case",R,"Cafe",28,"12:10","available",""),
("phone",["blue"],"Samsung","Blue phone with a cracked screen",S,"Near the stairs",25,"16:20","available",""),
("charger",["white"],"Apple","White charging cable and power adapter",SC,"Room off the hallway",27,"15:45","available",""),
("tablet",["silver"],"Apple","Silver tablet with a black cover",H,"Classroom",26,"14:30","available",""),
("calculator",["black"],"Texas Instruments","Black graphing calculator",SC,"Lecture hall",25,"13:20","available","K. LEE"),
("watch",["black"],"Garmin","Black sports watch",P,"Cardio area",27,"17:25","available",""),
("headphones",["black"],"Sony","Black over-ear headphones",W,"3rd floor",26,"13:50","available",""),
("headphones",["white"],"Bose","White over-ear headphones in a case",D,"Near the entrance",24,"14:40","available",""),
("keys",["silver"],None,"Set of keys on a ring with a red tag",RH,"Lobby",28,"12:55","available",""),
("id_card",["white"],None,"Student ID card",S,"Front desk",27,"14:05","available","A. PATEL"),
("id_card",["blue"],None,"Student ID card in a plastic holder",G,"Hallway",23,"12:35","resolved","J. NGUYEN"),
("notebook",["red"],None,"Red spiral notebook",H,"Classroom",26,"15:15","available","D. ROMERO"),
("textbook",["blue"],None,"Large blue textbook",R,"Study room",24,"15:15","available","S. KIM"),
("umbrella",["black"],None,"Black folding umbrella",M,None,22,"13:40","available",""),
("glasses",["black"],None,"Black-framed glasses in a case",W,"Circulation desk",28,"16:00","available",""),
("sunglasses",["brown"],"Ray-Ban","Brown sunglasses",Q,"Near the benches",21,"14:20","available",""),
("hat",["gray"],"Nike","Gray baseball cap",M,None,23,"15:50","available",""),
("scarf",["gray"],None,"Gray knit scarf",CS,"Bus stop",22,"12:40","available",""),
("gloves",["black"],None,"Pair of black gloves",CS,"Bus stop",21,"13:10","available",""),
("sweater_or_hoodie",["gray"],"Champion","Gray hooded sweatshirt",P,"Bench",25,"19:00","available",""),
("sweater_or_hoodie",["red"],None,"Red crewneck sweater",C,"Table in the seating area",24,"12:55","available",""),
("tote_bag",["beige"],None,"Beige canvas tote bag",D,"Second floor",26,"16:30","available",""),
("purse_or_wallet",["brown"],"Coach","Brown leather wallet",S,"Food court",22,"12:20","resolved","T. BROWN"),
("jewelry",["gold"],None,"Thin gold chain necklace",RH,"Common room",27,"18:15","available",""),
("other",["yellow","multicolor"],None,"Small stuffed toy on a keychain",O,None,28,"14:00","available",""),
("other",["green"],None,"Green yoga mat",P,"Studio entrance",24,"20:00","available",""),
("keys",["black","silver"],None,"Car key fob on a lanyard",PD,"Level 3",23,"17:40","available",""),
]
items=[]
for i,(t,c,b,d,a,ld,day,hm,st,tx) in enumerate(rows,1):
    id=f"item_{i:04d}"
    items.append({"public":{"id":id,"category":CAT[t],"item_type":t,"colors":c,"brand":b,"description":d,"area":a,"location_detail":ld,
     "found_at":f"2026-09-{day:02d}T{hm}:00Z","image_url":f"stubs/images/{id}.jpg"},
     "server_only":{"finder_id":f"user_{100+ (i*37)%900}","detected_text":tx,"status":st}})
json.dump(items,open("stubs/foundyou-fake-items.json","w"),indent=2)
print(len(items))
