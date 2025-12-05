import { StyleSheet } from 'react-native';


// Brand colours
const BRAND = {
  textGray: '#545656',
  green: '#719D54',
  teal: '#4F7477',
  gradient: ['#719D54', '#4F7477'],
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F7F5' },

  /** Sidebar */
  sidebar: {
    width: 180,
    backgroundColor: BRAND.green,
    paddingTop: 30,
    paddingHorizontal: 15,
  },
  sidebarIcon: { width: 140, height: 40, marginBottom: 30, resizeMode: 'contain' },
  sidebarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sidebarButtonText: {
    color: '#fff',
    fontFamily: 'Montserrat',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },

  /** Top Bar */
  mainArea: { flex: 1 },
  topBar: {
    height: 60,
    backgroundColor: BRAND.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    elevation: 4,
  },
  topTitle: { fontSize: 22, fontFamily: 'Montserrat', fontWeight: '600', color: '#fff' },
  userCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: { color: '#fff', fontWeight: '600' },

  content: { flex: 1, padding: 20 },

  /** Metrics */
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metricCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
  },
  metricTitle: { fontFamily: 'Montserrat', fontSize: 14, color: '#fff', marginTop: 5 },
  metricValue: { fontFamily: 'Montserrat', fontSize: 22, fontWeight: '700', color: '#fff' },

  /** Heatmap */
  heatmapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    position: 'relative',
    marginBottom: 20,
    elevation: 3,
    backgroundColor: '#DDE6DE',
  },
  sensorPin: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinText: { color: '#fff', fontFamily: 'Montserrat', fontWeight: '600' },

  /** Sensor Cards */
  sectionTitle: { fontSize: 20, fontFamily: 'Montserrat', fontWeight: '600', color: BRAND.textGray, marginBottom: 10 },
  sensorsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  sensorCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E3E8E3',
  },
  sensorName: { fontFamily: 'Montserrat', fontSize: 14, color: BRAND.textGray, marginBottom: 5 },
  sensorValue: { fontFamily: 'Montserrat', fontSize: 20, fontWeight: '600', color: BRAND.teal },
  statusBar: { height: 8, borderRadius: 4 },
});

export default styles;
