import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'

type ProfileData = {
  employeeId: string
  firstName: string
  lastName: string
  nickName: string
  email: string
  password: string
  workPhone: string
  personalMobile: string
  presentAddress: string
  seatingState: string
  permanentAddress: string
  emergencyName: string
  emergencyAddress: string
  emergencyCity: string
  emergencyPostalCode: string
  emergencyMobile: string
  company: string
  employeeStatus: string
  dateOfJoining: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  aboutMe: string
  expertise: string
  linkedin: string
  bloodGroup: string
  nationality: string
  education: string
}

const ABOUT_MAX = 200
const GENDERS = ['Male', 'Female', 'Other']
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed']
const STATUSES = ['Active', 'Probation', 'Intern', 'Inactive']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COUNTRIES: string[] = (() => {
  const dn = new Intl.DisplayNames(['en'], { type: 'region' })
  const names = new Set<string>()
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b)
      try {
        const n = dn.of(code)
        if (n && n !== code) names.add(n)
      } catch {
        /* invalid region code */
      }
    }
  }
  return [...names].sort()
})()

const storageKey = () => `profile_${sessionStorage.getItem('userId') ?? 'me'}`

function load(): ProfileData {
  const fullName = (sessionStorage.getItem('name') || '').trim().split(/\s+/)
  const defaults: ProfileData = {
    employeeId: sessionStorage.getItem('userId') || '',
    firstName: fullName[0] || '',
    lastName: fullName.slice(1).join(' '),
    nickName: '',
    email: sessionStorage.getItem('email') || '',
    password: '',
    workPhone: '',
    personalMobile: '',
    presentAddress: '',
    seatingState: '',
    permanentAddress: '',
    emergencyName: '',
    emergencyAddress: '',
    emergencyCity: '',
    emergencyPostalCode: '',
    emergencyMobile: '',
    company: 'Nexturn',
    employeeStatus: 'Active',
    dateOfJoining: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    aboutMe: '',
    expertise: '',
    linkedin: '',
    bloodGroup: '',
    nationality: '',
    education: '',
  }
  try {
    const saved = localStorage.getItem(storageKey())
    return saved ? { ...defaults, ...JSON.parse(saved), password: '' } : defaults
  } catch {
    return defaults
  }
}

function calcAge(dob: string): string {
  if (!dob) return ''
  const d = new Date(dob)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age >= 0 ? String(age) : ''
}

function Profile() {
  const [data, setData] = useState<ProfileData>(load)
  const [draft, setDraft] = useState<ProfileData>(data)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('Profile updated')

  const current = editing ? draft : data
  const age = useMemo(() => calcAge(current.dateOfBirth), [current.dateOfBirth])

  const set = (key: keyof ProfileData) => (value: string) =>
    setDraft((p) => ({ ...p, [key]: value }))

  const startEdit = () => {
    setDraft(data)
    setEditing(true)
  }

  const cancel = () => setEditing(false)

  const save = () => {
    // The password is never persisted client-side.
    const { password: _pw, ...rest } = draft
    void _pw
    localStorage.setItem(storageKey(), JSON.stringify(rest))
    sessionStorage.setItem('name', `${draft.firstName} ${draft.lastName}`.trim())
    sessionStorage.setItem('email', draft.email)
    setData({ ...draft, password: '' })
    setEditing(false)
    setToastMsg('Profile updated')
    setToast(true)
  }

  const field = (
    label: string,
    key: keyof ProfileData,
    opts: {
      type?: string
      options?: string[]
      multiline?: boolean
      maxLength?: number
      readOnly?: boolean
      xs?: number
    } = {},
  ) => {
    const isSelect = !!opts.options
    const isDate = opts.type === 'date'
    return (
      <Grid size={{ xs: 12, sm: opts.xs ?? 6 }} key={key}>
        <TextField
          fullWidth
          size="small"
          select={isSelect}
          label={label}
          type={opts.type === 'password' ? 'password' : opts.type}
          value={current[key]}
          multiline={opts.multiline}
          minRows={opts.multiline ? 3 : undefined}
          disabled={!editing || opts.readOnly}
          onChange={(e) => set(key)(e.target.value)}
          slotProps={{
            htmlInput: { maxLength: opts.maxLength },
            inputLabel: isDate ? { shrink: true } : undefined,
          }}
          helperText={
            key === 'aboutMe' && editing
              ? `${current.aboutMe.length}/${ABOUT_MAX}`
              : key === 'password' && editing
                ? 'Leave blank to keep your current password'
                : undefined
          }
        >
          {opts.options?.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
    )
  }

  const section = (title: string, children: React.ReactNode) => (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Paper>
  )

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Profile
        </Typography>
        {editing ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={cancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={save}>
              Save
            </Button>
          </Box>
        ) : (
          <Button variant="contained" startIcon={<EditIcon />} onClick={startEdit}>
            Edit
          </Button>
        )}
      </Box>

      {section(
        'Basic Information',
        <>
          {field('Employee ID', 'employeeId', { readOnly: true })}
          {field('First Name', 'firstName')}
          {field('Last Name', 'lastName')}
          {field('Nick Name', 'nickName')}
          {field('Email Address', 'email', { type: 'email' })}
          {field('Password', 'password', { type: 'password' })}
        </>,
      )}

      {section(
        'Contact Details',
        <>
          {field('Work Phone Number', 'workPhone', { type: 'tel', maxLength: 15 })}
          {field('Personal Mobile Number', 'personalMobile', { type: 'tel', maxLength: 15 })}
          {field('Present Address', 'presentAddress', { multiline: true })}
          {field('Seating State', 'seatingState')}
          {field('Permanent Address', 'permanentAddress', { multiline: true, xs: 12 })}
          {field('Emergency Contact Person Name', 'emergencyName')}
          {field('Emergency Mobile No.', 'emergencyMobile', { type: 'tel', maxLength: 15 })}
          {field('Emergency Address', 'emergencyAddress', { multiline: true })}
          {field('Emergency Address City', 'emergencyCity')}
          {field('Emergency Address Postal Code', 'emergencyPostalCode', { maxLength: 10 })}
        </>,
      )}

      {section(
        'Work Information',
        <>
          {field('Company', 'company')}
          {field('Employee Status', 'employeeStatus', { options: STATUSES })}
          {field('Date of Joining', 'dateOfJoining', { type: 'date' })}
        </>,
      )}

      {section(
        'Personal Details',
        <>
          {field('Date of Birth', 'dateOfBirth', { type: 'date' })}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth size="small" label="Age" value={age} disabled />
          </Grid>
          {field('Gender', 'gender', { options: GENDERS })}
          {field('Marital Status', 'maritalStatus', { options: MARITAL })}
          {field('About Me (Professional Introduction)', 'aboutMe', {
            multiline: true,
            maxLength: ABOUT_MAX,
            xs: 12,
          })}
          {field('Expertise (Skill / Tech Stack)', 'expertise', { xs: 12 })}
          {field('LinkedIn Profile URL', 'linkedin', { type: 'url' })}
          {field('Blood Group', 'bloodGroup', { options: BLOOD_GROUPS })}
          {field('Nationality', 'nationality', { options: COUNTRIES })}
          {field('Education Details', 'education', { multiline: true, xs: 12 })}
        </>,
      )}

      <Snackbar
        open={toast}
        autoHideDuration={3000}
        onClose={() => setToast(false)}
        message={toastMsg}
      />
    </Box>
  )
}

export default Profile
