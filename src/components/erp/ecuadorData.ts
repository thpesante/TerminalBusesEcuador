export interface Province {
  name: string;
  cantons: string[];
}

export const ecuadorProvinces: Province[] = [
  { name: "Azuay", cantons: ["Cuenca", "Camilo Ponce Enríquez", "Chordeleg", "El Pan", "Girón", "Guachapala", "Gualaceo", "Nabón", "Oña", "Paute", "Pucará", "San Fernando", "Santa Isabel", "Sevilla de Oro", "Sígsig"] },
  { name: "Bolívar", cantons: ["Guaranda", "Caluma", "Chillanes", "Chimbo", "Echeandía", "Las Naves", "San Miguel"] },
  { name: "Cañar", cantons: ["Azogues", "Biblián", "Cañar", "Déleg", "El Tambo", "La Troncal", "Suscal"] },
  { name: "Carchi", cantons: ["Tulcán", "Bolívar", "Espejo", "Mira", "Montúfar", "San Pedro de Huaca"] },
  { name: "Chimborazo", cantons: ["Riobamba", "Alausí", "Chambo", "Chunchi", "Colta", "Cumandá", "Guamote", "Guano", "Pallatanga", "Penipe"] },
  { name: "Cotopaxi", cantons: ["Latacunga", "La Maná", "Pangua", "Pujilí", "Salcedo", "Saquisilí", "Sigchos"] },
  { name: "El Oro", cantons: ["Machala", "Arenillas", "Atahualpa", "Balsas", "Chilla", "El Guabo", "Huaquillas", "Las Lajas", "Marcabelí", "Pasaje", "Piñas", "Portovelo", "Santa Rosa", "Zaruma"] },
  { name: "Esmeraldas", cantons: ["Esmeraldas", "Atacames", "Eloy Alfaro", "Muisne", "Quinindé", "Rioverde", "San Lorenzo"] },
  { name: "Galápagos", cantons: ["San Cristóbal", "Isabela", "Santa Cruz"] },
  { name: "Guayas", cantons: ["Guayaquil", "Alfredo Baquerizo Moreno (Juján)", "Balao", "Balzar", "Colimes", "Daule", "El Empalme", "El Triunfo", "General Antonio Elizalde (Bucay)", "Isidro Ayora", "Lomas de Sargentillo", "Marcelino Maridueña", "Milagro", "Naranjal", "Naranjito", "Nobol", "Palestina", "Pedro Carbo", "Playas", "Salitre", "Samborondón", "Santa Lucía", "Simón Bolívar", "Coronel Marcelino Maridueña", "Yaguachi"] },
  { name: "Imbabura", cantons: ["Ibarra", "Antonio Ante", "Cotacachi", "Otavalo", "Pimampiro", "San Miguel de Urcuquí"] },
  { name: "Loja", cantons: ["Loja", "Calvas", "Catamayo", "Celica", "Chaguarpamba", "Espíndola", "Gonzanamá", "Macará", "Olmedo", "Paltas", "Pindal", "Puyango", "Quilanga", "Saraguro", "Sozoranga", "Zapotillo"] },
  { name: "Los Ríos", cantons: ["Babahoyo", "Baba", "Buena Fe", "Mocache", "Montalvo", "Palenque", "Puebloviejo", "Quevedo", "Quinsaloma", "Urdaneta", "Valencia", "Ventanas", "Vinces"] },
  { name: "Manabí", cantons: ["Portoviejo", "24 de Mayo", "Bolívar", "Chone", "El Carmen", "Flavio Alfaro", "Jama", "Jaramijó", "Jipijapa", "Junín", "Manta", "Montecristi", "Olmedo", "Paján", "Pedernales", "Pichincha", "Puerto López", "Rocafuerte", "Santa Ana", "San Vicente", "Sucre", "Tosagua"] },
  { name: "Morona Santiago", cantons: ["Macas (Morona)", "Gualaquiza", "Huamboya", "Limón Indanza", "Logroño", "Pablo Sexto", "Palora", "San Juan Bosco", "Santiago", "Sevilla Don Bosco", "Sucúa", "Taisha", "Tiwintza"] },
  { name: "Napo", cantons: ["Tena", "Archidona", "Carlos Julio Arosemena Tola", "El Chaco", "Quijos"] },
  { name: "Orellana", cantons: ["Francisco de Orellana", "Aguarico", "La Joya de los Sachas", "Loreto"] },
  { name: "Pastaza", cantons: ["Puyo (Pastaza)", "Arajuno", "Mera", "Santa Clara"] },
  { name: "Pichincha", cantons: ["Quito", "Cayambe", "Mejía", "Pedro Moncayo", "Pedro Vicente Maldonado", "Puerto Quito", "Rumiñahui", "San Miguel de los Bancos"] },
  { name: "Santa Elena", cantons: ["Santa Elena", "La Libertad", "Salinas"] },
  { name: "Santo Domingo de los Tsáchilas", cantons: ["Santo Domingo", "La Concordia"] },
  { name: "Sucumbíos", cantons: ["Nueva Loja (Lago Agrio)", "Cascales", "Cuyabeno", "Gonzalo Pizarro", "Putumayo", "Shushufindi", "Sucumbíos"] },
  { name: "Tungurahua", cantons: ["Ambato", "Baños de Agua Santa", "Cevallos", "Mocha", "Patate", "Pelileo", "Píllaro", "Quero", "Tisaleo"] },
  { name: "Zamora Chinchipe", cantons: ["Zamora", "Centinela del Cóndor", "Chinchipe", "El Pangui", "Nangaritza", "Palanda", "Paquisha", "Yacuambi", "Yantzaza"] }
];
