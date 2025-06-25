import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Container from '../../components/Container';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

export default function UpdateProfile({ route }) {
    const navigation = useNavigation();
    const data = route?.params?.data || {};
    const { user } = useAuth();

    const [fullName, setFullName] = useState(data.fullName || '');
    const [email, setEmail] = useState(data.email || '');
    const [phoneNumber, setPhoneNumber] = useState(data.phoneNumber || '');
    const [gender, setGender] = useState(data.gender ?? true);
    const [dob, setDob] = useState(data.dob || '');
    const [studentCode] = useState(data.studentCode || '');
    const [isEnableSurvey, setIsEnableSurvey] = useState(data.isEnableSurvey ?? false);
    const [teacherName] = useState(data.classDto?.teacher?.fullName || '');
    const [teacherEmail] = useState(data.classDto?.teacher?.email || '');
    const [codeClass] = useState(data.classDto?.codeClass || '');
    const [classYear] = useState(data.classDto?.classYear || '');

    const handleSave = () => {
        const payload = {
            fullName,
            email,
            phoneNumber,
            gender,
            dob,
            studentCode,
            isEnableSurvey,
            classDto: {
                teacher: {
                    fullName: teacherName,
                    email: teacherEmail,
                },
                codeClass,
                classYear,
            },
        };

        Alert.alert('Cập nhật thành công!', JSON.stringify(payload, null, 2));
    };

    return (
        <Container>
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-left" size={28} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarWrapper}>
                    <Icon name="account" size={90} color="#222" />
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.genderToggle}>
                        <TouchableOpacity onPress={() => setGender(true)} style={[styles.genderBtn, gender && styles.genderActive]}>
                            <Text style={gender && styles.genderActiveText}>Male</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setGender(false)} style={[styles.genderBtn, !gender && styles.genderActive]}>
                            <Text style={!gender && styles.genderActiveText}>Female</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="YYYY-MM-DD" />
                    {
                        user.role === "STUDENT" ?
                            <>
                                <Text style={styles.label}>Enable Survey</Text>
                                <Switch value={isEnableSurvey} onValueChange={setIsEnableSurvey} />

                                <Text style={styles.label}>Student Code</Text>
                                <TextInput style={styles.input} value={studentCode} editable={false} />

                                <Text style={styles.label}>Class</Text>
                                <TextInput style={styles.input} value={codeClass} editable={false} />

                                <Text style={styles.label}>Class Year</Text>
                                <TextInput style={styles.input} value={classYear} editable={false} />

                                <Text style={styles.label}>Teacher Name</Text>
                                <TextInput style={styles.input} value={teacherName} editable={false} />

                                <Text style={styles.label}>Teacher Email</Text>
                                <TextInput style={styles.input} value={teacherEmail} editable={false} />
                            </> : <></>
                    }


                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#181A3D',
    },
    avatarWrapper: {
        backgroundColor: '#F3F3F3',
        borderRadius: 100,
        padding: 18,
        alignSelf: 'center',
        marginBottom: 18,
    },
    scrollContainer: {
        paddingBottom: 32,
    },
    form: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    label: {
        fontSize: 15,
        color: '#181A3D',
        marginBottom: 4,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    saveBtn: {
        backgroundColor: '#181A3D',
        borderRadius: 10,
        marginTop: 28,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    genderToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
    },
    genderBtn: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    genderActive: {
        backgroundColor: '#181A3D',
        borderColor: '#181A3D',
    },
    genderActiveText: {
        color: '#fff',
    },
});