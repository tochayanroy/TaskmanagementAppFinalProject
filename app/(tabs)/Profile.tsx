import { useRouter } from 'expo-router'
import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

const Profile = () => {
  const router = useRouter()
  return (
    <View>
      <Text>Profile</Text>
      <Button title='Go Demo' onPress={()=>router.push('./Demo')}></Button>
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({})