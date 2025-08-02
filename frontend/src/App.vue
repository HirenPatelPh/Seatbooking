<template>
  <div class="container mt-5">
    <h2 class="text-center">Jai Laxminarayan</h2>
   
   <div
  class="stage-area mx-auto my-3"
  style="
    width: 100%;
    height: 50px;
    background-color: #444;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  "
>
  Stage Area
</div>
    <!-- Make the row horizontally scrollable -->
    <div class="d-flex flex-row flex-nowrap mt-4 overflow-auto" style="gap: 20px;">
      
      <!-- Seat layout column -->
      
      <div style="min-width: 650px;">
        <div v-for="(count, row) in seatRows" :key="row" class="mb-2">
          <strong>{{ row }}</strong>
          <div class="d-flex flex-wrap">
            <div
              v-for="seat in count"
              :key="row + seat"
              :class="[
                'seat',
                isReserved(row + seat)
                  ? 'reserved'
                  : isSelected(row + seat)
                  ? 'selected'
                  : 'available'
              ]"
              @click="toggleSeat(row + seat)"
            >
              {{ row + seat }}
            </div>
          </div>
        </div>
      </div>

      <!-- User form column -->
      <div style="min-width: 300px; max-width: 400px;">
        <form @submit.prevent="submitBooking">
          <div class="mb-2">
            <label>Name</label>
            <input v-model="user.name" class="form-control" required />
          </div>
          <div class="mb-2">
            <label>Email</label>
            <input v-model="user.email" type="email" class="form-control" required />
          </div>
          <div class="mb-2">
    <label>Yuvakmandal Name</label>
    <input v-model="user.yuvakmandal" class="form-control" />
  </div>

  <div class="mb-2">
    <label>WhatsApp Number</label>
    <input v-model="user.whatsapp" type="tel" class="form-control" />
  </div>

          <div class="mb-2">
            <label>Selected Seats</label>
            <input :value="selectedSeats.join(', ')" class="form-control" readonly />
          </div>
          
  <div class="mb-2">
    <label>Note</label>
    <textarea v-model="user.note" class="form-control" rows="2" placeholder="Optional notes..."></textarea>
  </div>
          <button class="btn btn-primary" type="submit" :disabled="selectedSeats.length === 0">
            Submit Booking
          </button>
        </form>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="alert alert-success mt-3">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'App',
  data() {
  return {
    seatRows: this.generateSeatRows(),
    reservedSeats: [],
    selectedSeats: [],
    user: {
      name: '',
      email: '',
      yuvakmandal: '',
      whatsapp: '',
      note: ''
    },
    successMessage: '',
    errorMessage: ''
  };
},
  methods: {
    // Create seat layout: { A: 25, G: 35, R: 40, ... }
    generateSeatRows() {
      const rows = {};
      const range = (start, end) =>
        [...Array(end.charCodeAt(0) - start.charCodeAt(0) + 1)].map((_, i) =>
          String.fromCharCode(start.charCodeAt(0) + i)
        );

      range('A', 'F').forEach((row) => (rows[row] = 25));
      range('G', 'Q').forEach((row) => (rows[row] = 35));
      range('R', 'Z').forEach((row) => (rows[row] = 40));

      return rows;
    },
    isReserved(seat) {
      return this.reservedSeats.includes(seat);
    },
    isSelected(seat) {
      return this.selectedSeats.includes(seat);
    },
    toggleSeat(seat) {
      if (this.isReserved(seat)) return;

      if (this.isSelected(seat)) {
        this.selectedSeats = this.selectedSeats.filter((s) => s !== seat);
      } else {
        this.selectedSeats.push(seat);
      }
    },
    async fetchReservedSeats() {
      try {
        const res = await axios.get('http://localhost:3001/api/booked-seats');
        this.reservedSeats = res.data.booked;
      } catch (error) {
        console.error('Failed to fetch reserved seats:', error);
      }
    },
     async submitBooking() {
  this.successMessage = '';
  this.errorMessage = '';

  if (!this.user.name || !this.user.email || !this.user.email || this.selectedSeats.length === 0) {
    this.errorMessage = 'Please fill all fields and select at least one seat.';
    return;
  }

  // Check if any selected seats are now reserved
  const conflictSeats = this.selectedSeats.filter(seat =>
    this.reservedSeats.includes(seat)
  );

  if (conflictSeats.length > 0) {
    this.errorMessage = `Some selected seats are already booked: ${conflictSeats.join(', ')}. Please reselect.`;
    // Optionally auto-deselect the conflicting ones:
    this.selectedSeats = this.selectedSeats.filter(seat => !conflictSeats.includes(seat));
    return;
  }

  const payload = {
    name: this.user.name,
    email: this.user.email,
    seats: this.selectedSeats,
    yuvakmandal: this.yuvakmandal,
    whatsapp: this.whatsapp,
    note: this.note
  };

  try {
    await axios.post('http://localhost:3001/api/book', payload);
    this.successMessage = '🎉 Booking successful!';
    this.user.name = '';
    this.user.email = '';
    this.user.yuvakmandal = '';
    this.user.whatsapp = '';
    this.user.note = '';
    this.selectedSeats = [];
    await this.fetchReservedSeats();
  } catch (error) {
    console.error(error);
    this.errorMessage = 'Booking failed. Try again later.';
  }
}
  },
  mounted() {
    this.fetchReservedSeats();
  }
};
</script>

<style scoped>
.seat {
  width: 30px;
  height: 30px;
  line-height: 25px;
  margin: 5px;
  text-align: center;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  user-select: none;
}
.available {
  background-color: #ccc;
}
.selected {
  background-color: #4caf50;
  color: #fff;
}
.reserved {
  background-color: #e53935;
  color: #fff;
  cursor: not-allowed;
}
.container {
  overflow-x: auto;
}

</style>
