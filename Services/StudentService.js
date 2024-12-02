import EventEmitter from "./EventEmitter.js";
class StudentService extends EventEmitter {
  constructor({ dataPath, courseService = null }) {
    super();
    this.key = "students";
    this.courseService = courseService;
    this.dataPath = dataPath ?? "./data/students.json";

    this.initData();
  }

  async initData() {
    if (!localStorage.getItem("students")) {
      const data = await this.fetchData();
      localStorage.setItem("students", JSON.stringify(data));
    }
  }

  async fetchData() {
    try {
      const response = await fetch(this.dataPath);
      const students = await response.json();

      // Ensure takenCourses is always an array
      return students.map((student) => ({
        ...student,
        takenCourses: student.takenCourses || [], // Default to an empty array
        grades: student.grades || [], // Default to an empty array
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      return []; // Return an empty array in case of error
    }
  }

  // Read all students
  readStudents() {
    const students = JSON.parse(localStorage.getItem(this.key)) || [];
    return students;
  }

  findStudentById(id) {
    const students = this.readStudents();
    return students.find((item) => item.studentId === +id);
  }
  // Create a new student
  async createStudent(newStudent) {
    const students = this.readStudents();
    students.push(newStudent);
    return this.saveStudents(students);
  }

  // Update a student by ID
  updateStudent(studentId, updatedStudent) {
    const students = this.readStudents();
    const index = students.findIndex(
      (student) => student.studentId === +studentId
    );

    delete updatedStudent.studentId;

    if (index !== -1) {
      students[index] = { ...students[index], ...updatedStudent };
      this.saveStudents(students);
    } else {
      console.log(`Student with ID ${studentId} not found.`);
    }
  }

  // Delete a student by ID
  async deleteStudent(studentId) {
    console.log("deleteStudent: ", studentId);
    const students = this.readStudents();
    const filteredStudents = students.filter(
      (student) => student.studentId !== +studentId // it has to number type
    );
    await this.saveStudents(filteredStudents);
    return studentId;
  }

  // Save students to localStorage
  async saveStudents(students) {
    localStorage.setItem(this.key, JSON.stringify(students));
    return students;
  }

  // Edit student
  editStudents(students) {
    localStorage.setItem(this.key, JSON.stringify(students));
  }

  // List students

  renderStudents(data = null) {
    const self = this;
    const studentTableBody = document.querySelector("#studentTable tbody");
    studentTableBody.innerHTML = "";
    const studentsToRender = data ?? this.students; // : this.readStudents();
    studentsToRender.forEach((student, index) => {
      const row = document.createElement("tr");
      row.classList.add(index % 2 === 0 ? "even" : "odd");

      row.dataset.data = JSON.stringify(student);
      row.dataset.rowIndex = index;
      row.innerHTML = `
               <td>${index + 1}</td>
               <td>${student.name}</td>
               <td>${student.surname}</td>
               <td>${student.studentId}</td>
               <td>${student.gpa}</td>
               <td>${
                 student.takenCourses ? student.takenCourses.join(", ") : ""
               }</td> 
               <td>${
                 student.courses
                   ? student.courses.map((course) => course.midterm +'/'+ course.final +':' + course.gradeLetter ).join(", ")
                   : ""
               }</td>
               <td>${
                 student.courses
                   ? student.courses.map((course) => course.gradeLetter ).join(", ")
                   : ""
               }</td>
               <i id="ibtnEdit" class="material-icons icon" 
                   style="font-size:24px; cursor: pointer" title="Edit"
                   dataset-studentId="${student.studentId}"
                   dataset-studentName="${student.name}"
                   dataset-studentSurname="${student.surname}"
                   dataset-data="${JSON.stringify(student)}"">edit</i>
               <i id="ibtnDelete" class="material-icons icon"
                  style="font-size:24px; cursor: pointer" title="Delete"
                  dataset-studentId="${student.studentId}"
                  dataset-studentName="${student.name}"
                  dataset-studentSurname="${student.surname}"
                  dataset-data="${JSON.stringify(student)}"
                  >delete</i>
               </td> `;

      row.addEventListener("click", function (e) {
        const tr = e.target.closest("tr");
        const { dataset } = tr ?? {};
        console.log("tr: click ", e);
        console.log("tr:", {
          data: dataset?.data ?? null,
          rowIndex: dataset.rowIndex,
        });
        const focusedRow = document.querySelector(".focused");
        if (focusedRow) {
          focusedRow.classList.remove("focused");
        }
        row.classList.add("focused");
      });

      row.addEventListener("dblclick", function (e) {
        const tr = e.target.closest("tr");
        const { dataset } = tr ?? {};

        console.log("tr dblclick:", {
          data: dataset?.data ?? null,
          rowIndex: dataset.rowIndex,
        });
        self.emit("onClickEdit", e);
        self.emit("onRowDblClick", e);
      });
      studentTableBody.appendChild(row);
    });
    this.emit("onRenderedData", data);
  }

  // Searching for students
  searchStudents(keyword) {
    const students = this.readStudents();
    keyword = keyword.toString().toLowerCase();
    const filteredStudents = students.filter(
      (student) =>
        student.name.toLowerCase().includes(keyword) ||
        student.surname.toLowerCase().includes(keyword) ||
        student.studentId.toString().includes(keyword) ||
        student.takenCourses.join(", ").includes(keyword) ||
        student.grades.flat().join(", ").includes(keyword)
    );
    return filteredStudents;
  }

  getMaxId() {
    const students = this.readStudents();
    if (students.length === 0) return 0; // If there is no student, return 0.

    // Check the studentId of each student in the array and take the largest one.
    const maxId = students.reduce((max, student) => {
      return student.studentId > max ? student.studentId : max;
    }, 0); // The initial value is 0 because we need to calculate the lowest possible id of 0.

    return maxId;
  }

  get studentCount() {
    const data = this.readStudents();
    return data?.length ?? 0;
  }

  calcGradeLetter(midterm, final, gradescale) {
    const total = 0.4 * midterm + 0.6 * final;
    if (gradescale === 10) {
      return total >= 90
        ? "A"
        : total >= 80
        ? "B"
        : total >= 70
        ? "C"
        : total >= 60
        ? "D"
        : "F";
    } else if (gradescale === 7) {
      return total >= 93
        ? "A"
        : total >= 86
        ? "B"
        : total >= 79
        ? "C"
        : total >= 72
        ? "D"
        : "F";
    }
  }

  gradeLetterToGPA(gradeLetter) {
    const gradeMapping = {
      A: 4,
      B: 3,
      C: 2,
      D: 1,
      F: 0,
    };

    return gradeMapping[gradeLetter] || 0; // Default to 0 if the grade letter is not found
  }

  calcGPA(courses) {
    // A:4 B:3 C:2 D:1 F:0
    let gpa = 0;
    courses.forEach((course) => {
      const gradeLetter = this.calcGradeLetter(
        course.midterm,
        course.final,
        course.gradeScale
      ); // we find the letters corresponding value
      gpa += this.gradeLetterToGPA(gradeLetter); // add it to gpa
    });
    gpa = gpa / courses.length;
    return isNaN(gpa) ? 0 : gpa.toFixed(2);
  }

  studentCountByCourse(courseId) {
    const data = this.readStudents();
    const course = data.filter((item) => item.takenCourses.includes(courseId));
    return course?.length ?? 0;
  }

  get students() {
    const data = this.readStudents();

    const students = data.map((item) => {
      const takenCourses = item.takenCourses.map((courseId, index) => {
        const course = this.courseService.findCourseById(courseId);
        const midterm = item.grades[index][0];
        const final = item.grades[index][1];
        const isTenBased = course?.isTenBased ?? true;
        const gradeScale = isTenBased ? 10 : 7;
        const gradeLetter = this.calcGradeLetter(midterm, final, gradeScale);
        const gpa = this.gradeLetterToGPA(gradeLetter);

        return {
          courseId,
          midterm,
          final,
          gradeLetter,
          gpa,
          gradeScale,
        };
      });
      const gpa = this.calcGPA(takenCourses);
      return {
        ...item,
        courses: takenCourses,
        gpa,
      };
    });

    return students;
  }
}

export default StudentService;
