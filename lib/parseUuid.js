export default function parseUuid(string) {
  var uuid_arr = string.split( '-' );
  var time_str = [
      uuid_arr[ 2 ].substring( 1 ),
      uuid_arr[ 1 ],
      uuid_arr[ 0 ],
  ].join( '' );
  return Math.floor((parseInt( time_str, 16 ) - 122192928000000000) / 10000);
}