export default function text2json(input: string) {
  let json;
  try {
    json = JSON.parse(input);
    return json;
  } catch (e) {
    return JSON.parse(JSON.stringify(input));
  }
}
