/* Local seed/demo content — Tulane Housing Hub.
   Temporary stand-in for the Supabase database so pages look real while we build.
   Domain content is placeholder for Taylor to refine. Order in each array = most recent first. */
window.SEED = {
  reviews: [
    { id:'r1', review_type:'landlord', subject:'Maple Street Rentals', landlord_type:'Private landlord',
      neighborhood:'Carrollton', rating:4,
      text:'Responsive on repairs and returned our deposit in full. A little slow to answer texts, but fair overall.' },
    { id:'r2', review_type:'property', subject:'Maple Manor Apts', property_address:'1031 Maple St',
      lived_window:'2024–2025', neighborhood:'Carrollton', rating:5,
      text:'Great natural light and on-site laundry. Walls are thin between units, so bring a fan for white noise.' },
    { id:'r3', review_type:'landlord', subject:'Eastbank Property Group', landlord_type:'Management company',
      neighborhood:'Uptown', rating:3,
      text:'Lease terms were clear up front. Took most of the summer to fix the AC, though — keep records of every request.' },
    { id:'r4', review_type:'property', subject:'The Marquette', property_address:'1100 Broadway St',
      lived_window:'2023–2024', neighborhood:'Riverbend', rating:4,
      text:'Walkable to the streetcar and campus. Parking lot fills up fast on game days.' },
    { id:'r5', review_type:'landlord', subject:'Audubon Place Mgmt', landlord_type:'Management company',
      neighborhood:'Audubon', rating:5,
      text:'Easiest landlord I have had near campus. Online rent portal and quick maintenance turnaround.' },
    { id:'r6', review_type:'property', subject:'Freret Flats', property_address:'4500 Freret St',
      lived_window:'2024–2025', neighborhood:'Freret', rating:3,
      text:'Good location right by the restaurants. Older building, so expect the occasional plumbing quirk.' },
    { id:'r7', review_type:'landlord', subject:'T. Boudreaux (private)', landlord_type:'Private landlord',
      neighborhood:'Freret', rating:2,
      text:'Friendly in person but hard to reach when the water heater went out. Deposit took about 45 days to return.' },
    { id:'r8', review_type:'property', subject:'Broadmoor Doubles', property_address:'3700 General Pershing',
      lived_window:'2023–2024', neighborhood:'Broadmoor', rating:4,
      text:'Spacious shotgun double with a real porch. Landlord lives nearby and is genuinely responsive.' }
  ],
  sublets: [
    { id:'s1', title:'1BR near campus — May–Aug', neighborhood:'Maple', price:850, beds_baths:'1 bd / 1 ba',
      move_in:'2026-05-15', end_date:'2026-08-15', contact_method:'email', contact_value:'student@tulane.edu',
      description:'Bright 1BR in a quiet duplex, 10-min walk to campus. Kitchen and laundry shared with one roommate. Subletting for a summer internship — flexible on exact dates.' },
    { id:'s2', title:'Studio off Magazine', neighborhood:'Uptown', price:1100, beds_baths:'Studio',
      move_in:'2026-06-01', end_date:'2026-08-15', contact_method:'email', contact_value:'student@tulane.edu',
      description:'Sunny studio near Magazine St with easy access to campus and the streetcar. Quiet building, great for a summer of research or an internship.' },
    { id:'s3', title:'Room in 2BR, Broadmoor', neighborhood:'Broadmoor', price:700, beds_baths:'1 of 2 bd',
      move_in:'2026-05-15', end_date:'2026-07-31', contact_method:'phone', contact_value:'504-555-0142',
      description:'One room available in a 2BR for the summer. Furnished common areas, washer/dryer in unit, street parking.' },
    { id:'s4', title:'2BR shotgun, Freret', neighborhood:'Freret', price:1450, beds_baths:'2 bd / 1 ba',
      move_in:'2026-06-01', end_date:'2026-08-20', contact_method:'email', contact_value:'student@tulane.edu',
      description:'Whole 2BR shotgun for summer sublet. Front porch, washer/dryer, right by the Freret strip and the bus line.' }
  ]
};
