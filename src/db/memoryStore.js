let nextStudentId = 3;

const students = [
  {
    id: 1,
    name: "Alumno Demo",
    hourlyRate: 12000,
    contact: "demo@email.com",
    notes: "Dato de ejemplo para probar la pantalla."
  },
  {
    id: 2,
    name: "Camila Prueba",
    hourlyRate: 15000,
    contact: "",
    notes: ""
  }
];

function listStudents() {
  return students;
}

function createStudent({ name, hourlyRate, contact, notes }) {
  const student = {
    id: nextStudentId,
    name,
    hourlyRate,
    contact,
    notes
  };

  nextStudentId += 1;
  students.push(student);

  return student;
}

module.exports = {
  listStudents,
  createStudent
};
