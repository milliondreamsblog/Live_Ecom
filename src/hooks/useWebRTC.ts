import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { PC_CONFIG } from '../services/rtcConfig';

export const useWebRTC = (roomId: string, isHost: boolean) => {
    const { socket } = useSocket();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const pcs = useRef<{ [key: string]: RTCPeerConnection }>({});
    const pc = useRef<RTCPeerConnection | null>(null);

    const localStreamRef = useRef<MediaStream | null>(null);
    useEffect(() => { localStreamRef.current = localStream; }, [localStream]);

    useEffect(() => {
        if (!socket || !roomId) return;

        if (isHost) {

            const handleWatcher = async (id: string) => {
                const peer = new RTCPeerConnection(PC_CONFIG);
                pcs.current[id] = peer;

                if (localStreamRef.current) {
                    localStreamRef.current.getTracks().forEach(track => {
                        peer.addTrack(track, localStreamRef.current!);
                    });
                }

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('candidate', id, event.candidate);
                    }
                };

                const offer = await peer.createOffer();
                await peer.setLocalDescription(offer);
                socket.emit('offer', id, peer.localDescription);
            };

            const handleAnswer = async (id: string, desc: RTCSessionDescriptionInit) => {
                await pcs.current[id]?.setRemoteDescription(desc);
            };

            const handleCandidate = async (id: string, candidate: RTCIceCandidate) => {
                await pcs.current[id]?.addIceCandidate(new RTCIceCandidate(candidate));
            };

            const handleDisconnectPeer = (id: string) => {
                pcs.current[id]?.close();
                delete pcs.current[id];
            };

            socket.on('watcher', handleWatcher);
            socket.on('answer', handleAnswer);
            socket.on('candidate', handleCandidate);
            socket.on('disconnectPeer', handleDisconnectPeer);

            return () => {
                socket.off('watcher', handleWatcher);
                socket.off('answer', handleAnswer);
                socket.off('candidate', handleCandidate);
                socket.off('disconnectPeer', handleDisconnectPeer);

                Object.values(pcs.current).forEach(p => p.close());
                pcs.current = {};
            };
        } else {

            const handleOffer = async (broadcasterId: string, desc: RTCSessionDescriptionInit) => {
                const peer = new RTCPeerConnection(PC_CONFIG);
                pc.current = peer;

                peer.ontrack = (event) => {
                    setRemoteStream(event.streams[0]);
                };

                peer.onicecandidate = (event) => {
                    if (event.candidate) {
                        socket.emit('candidate', broadcasterId, event.candidate);
                    }
                };

                await peer.setRemoteDescription(desc);
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit('answer', broadcasterId, peer.localDescription);
            };

            const handleCandidate = async (broadcasterId: string, candidate: RTCIceCandidate) => {
                await pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
            };

            const handleBroadcaster = () => {
                socket.emit('watcher', roomId);
            }

            socket.on('offer', handleOffer);
            socket.on('candidate', handleCandidate);
            socket.on('broadcaster', handleBroadcaster);

            socket.emit('join-room', roomId);
            socket.emit('watcher', roomId);

            return () => {
                socket.off('offer', handleOffer);
                socket.off('candidate', handleCandidate);
                socket.off('broadcaster', handleBroadcaster);
                pc.current?.close();
                pc.current = null;
            };
        }
    }, [socket, roomId, isHost]);

    return { localStream, setLocalStream, remoteStream };
};
