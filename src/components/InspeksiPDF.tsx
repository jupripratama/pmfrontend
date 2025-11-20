// src/components/InspeksiPDF.tsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Roboto' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#1e40af' },
  subtitle: { fontSize: 16, marginBottom: 10, color: '#1e40af' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#e5e7eb' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableCol: { width: '8.33%', borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 5 },
  tableColWide: { width: '16.66%', borderRightWidth: 1, borderRightColor: '#e5e7eb', padding: 5 },
  tableHeader: { backgroundColor: '#dbeafe', fontWeight: 'bold', fontSize: 10 },
  tableCell: { fontSize: 9 },
  image: { width: 60, height: 60, objectFit: 'cover' },
});

interface Props {
  data: any[];
  lokasi: string;
}

export default function InspeksiPDF({ data, lokasi }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        <Text style={styles.title}>Laporan Inspeksi KPC</Text>
        <Text style={styles.subtitle}>Lokasi: {lokasi || 'Semua Lokasi'}</Text>
        <Text style={{ fontSize: 10, marginBottom: 10 }}>Tanggal: {format(new Date(), 'dd MMMM yyyy')}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCol}>No</Text>
            <Text style={styles.tableCol}>Lokasi</Text>
            <Text style={styles.tableCol}>Unit</Text>
            <Text style={styles.tableColWide}>Temuan</Text>
            <Text style={styles.tableCol}>Foto</Text>
            <Text style={styles.tableCol}>Follow Up</Text>
            <Text style={styles.tableCol}>Tgl Temuan</Text>
            <Text style={styles.tableColWide}>Perbaikan</Text>
            <Text style={styles.tableCol}>Tgl</Text>
            <Text style={styles.tableCol}>PIC</Text>
            <Text style={styles.tableCol}>Pelaksana</Text>
            <Text style={styles.tableCol}>Hasil</Text>
            <Text style={styles.tableCol}>Keterangan</Text>
            <Text style={styles.tableCol}>Status</Text>
          </View>

          {data.map((item, i) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.tableCol}>{i + 1}</Text>
              <Text style={styles.tableCol}>{item.lokasi}</Text>
              <Text style={styles.tableCol}>{item.unit}</Text>
              <Text style={styles.tableColWide}>{item.temuan}</Text>
              <View style={styles.tableCol}>
                {item.fotoUrl ? <Image style={styles.image} src={item.fotoUrl} /> : <Text>-</Text>}
              </View>
              <Text style={styles.tableCol}>{item.followUpEmail || item.followUpWrWo || '-'}</Text>
              <Text style={styles.tableCol}>{item.tanggalTemuan ? format(new Date(item.tanggalTemuan), 'dd/MM') : '-'}</Text>
              <Text style={styles.tableColWide}>{item.perbaikan || '-'}</Text>
              <Text style={styles.tableCol}>{item.tanggalPerbaikan ? format(new Date(item.tanggalPerbaikan), 'dd/MM') : '-'}</Text>
              <Text style={styles.tableCol}>{item.pic || '-'}</Text>
              <Text style={styles.tableCol}>{item.pelaksana || '-'}</Text>
              <View style={styles.tableCol}>
                {item.hasilFotoUrl ? <Image style={styles.image} src={item.hasilFotoUrl} /> : <Text>-</Text>}
              </View>
              <Text style={styles.tableCol}>{item.keterangan || '-'}</Text>
              <Text style={styles.tableCol}>{item.status === 'open' ? 'Open' : 'Closed'}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}