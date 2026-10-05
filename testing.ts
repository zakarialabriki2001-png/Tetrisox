import { DateTimeSystem } from './src/lib/dateTimeSystem';
console.log("HELLO_TEST");
try {
  console.log(DateTimeSystem.parse('23/05/2026 23:00'));
  console.log(DateTimeSystem.toLocalDateString(new Date()));
} catch (e) {
  console.error(e);
}
