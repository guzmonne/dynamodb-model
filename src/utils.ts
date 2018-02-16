export function btoa(string: string): string {
  return new Buffer(string).toString('base64');
}

export function atob(string: string): string {
  return new Buffer(string, 'base64').toString('ascii');
}
