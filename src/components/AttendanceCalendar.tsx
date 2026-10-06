import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import type { Attendance } from "../types/Attendance";
import type { Intern } from "../types/Intern";

import AttendanceChart from "./AttendanceChart";
import AttendanceLegend from "./AttendanceLegend";
import MonthlyAttendanceGrid from "./MonthlyAttendanceGrid";

type Props = {
  attendance: Attendance[];
  interns: Intern[];
};

type Role = "HR" | "MENTOR" | "INTERN" | null;

function AttendanceCalendar({
  attendance,
  interns,
}: Props) {
  const role = localStorage.getItem(
    "role"
  ) as Role;

  const userName =
    localStorage.getItem("name") || "";

  const visibleInterns =
    role === "HR"
      ? interns
      : role === "MENTOR"
      ? interns.filter(
          (intern) =>
            intern.mentor === userName
        )
      : interns.filter(
          (intern) =>
            intern.name === userName
        );

  const [selectedIntern, setSelectedIntern] =
    useState(
      role === "INTERN"
        ? userName
        : visibleInterns[0]?.name || ""
    );

  const [selectedMonth, setSelectedMonth] =
    useState(new Date().getMonth() + 1);

  const [selectedYear, setSelectedYear] =
    useState(new Date().getFullYear());

  useEffect(() => {
    if (
      role !== "INTERN" &&
      visibleInterns.length > 0 &&
      !visibleInterns.some(
        (intern) =>
          intern.name === selectedIntern
      )
    ) {
      setSelectedIntern(
        visibleInterns[0].name
      );
    }
  }, [
    role,
    selectedIntern,
    visibleInterns,
  ]);

  const filteredAttendance = attendance.filter(
    (item) => {
      const itemDate = new Date(item.date);

      return (
        item.intern === selectedIntern &&
        itemDate.getMonth() + 1 ===
          selectedMonth &&
        itemDate.getFullYear() ===
          selectedYear
      );
    }
  );

  const presentCount =
    filteredAttendance.filter(
      (item) => item.status === "Present"
    ).length;

  const absentCount =
    filteredAttendance.filter(
      (item) => item.status === "Absent"
    ).length;

  const leaveCount =
    filteredAttendance.filter(
      (item) => item.status === "Leave"
    ).length;

  const holidayCount =
    filteredAttendance.filter(
      (item) => item.status === "Holiday"
    ).length;

  const wfhCount =
    filteredAttendance.filter(
      (item) => item.status === "WFH"
    ).length;

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
      }}
    >
      {/* Dropdowns */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        {(role === "HR" ||
          role === "MENTOR") && (
          <FormControl
            sx={{
              minWidth: 200,
            }}
          >
            <InputLabel>
              Intern
            </InputLabel>

            <Select
              value={selectedIntern}
              label="Intern"
              onChange={(e) =>
                setSelectedIntern(
                  e.target.value
                )
              }
            >
              {visibleInterns.map(
                (intern) => (
                  <MenuItem
                    key={intern.name}
                    value={intern.name}
                  >
                    {intern.name}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        )}

        <FormControl
          sx={{
            minWidth: 180,
          }}
        >
          <InputLabel>
            Month
          </InputLabel>

          <Select
            value={selectedMonth}
            label="Month"
            onChange={(e) =>
              setSelectedMonth(
                Number(e.target.value)
              )
            }
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month, index) => (
              <MenuItem
                key={month}
                value={index + 1}
              >
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          sx={{
            minWidth: 150,
          }}
        >
          <InputLabel>
            Year
          </InputLabel>

          <Select
            value={selectedYear}
            label="Year"
            onChange={(e) =>
              setSelectedYear(
                Number(e.target.value)
              )
            }
          >
            <MenuItem value={2025}>
              2025
            </MenuItem>

            <MenuItem value={2026}>
              2026
            </MenuItem>

            <MenuItem value={2027}>
              2027
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Statistics */}
      <AttendanceChart
        present={presentCount}
        absent={absentCount}
        leave={leaveCount}
        holiday={holidayCount}
        wfh={wfhCount}
      />

      {/* Calendar + Legend */}
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mt: 3,
          alignItems: "flex-start",
          flexDirection: {
            xs: "column",
            lg: "row",
          },
        }}
      >
        <Box
          sx={{
            flex: 4,
            width: "100%",
          }}
        >
          <MonthlyAttendanceGrid
            attendance={filteredAttendance}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 180,
          }}
        >
          <AttendanceLegend />
        </Box>
      </Box>
    </Paper>
  );
}

export default AttendanceCalendar;