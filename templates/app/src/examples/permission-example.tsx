import React, { useState, useEffect } from 'react';
import { usePermissions } from '@ai-marketplace/sdk/common/permissions';

/**
 * Example component demonstrating permission request patterns
 */
export const PermissionExample: React.FC = () => {
  const { request, check, requestAll, revoke } = usePermissions();
  
  // Track permission states
  const [hasMemoryReadPermission, setHasMemoryReadPermission] = useState(false);
  const [hasMemoryWritePermission, setHasMemoryWritePermission] = useState(false);
  const [hasUserProfilePermission, setHasUserProfilePermission] = useState(false);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(true);
  
  // Check existing permissions on mount
  useEffect(() => {
    const checkExistingPermissions = async () => {
      setIsCheckingPermissions(true);
      
      // Check memory read permission
      const canReadMemory = await check({
        type: 'memory',
        access: ['read'],
        scope: 'project'
      });
      setHasMemoryReadPermission(canReadMemory);
      
      // Check memory write permission
      const canWriteMemory = await check({
        type: 'memory',
        access: ['write'],
        scope: 'project'
      });
      setHasMemoryWritePermission(canWriteMemory);
      
      // Check user profile permission
      const canAccessProfile = await check({
        type: 'user',
        access: ['profile'],
        scope: 'read'
      });
      setHasUserProfilePermission(canAccessProfile);
      
      setIsCheckingPermissions(false);
    };
    
    checkExistingPermissions();
  }, []);
  
  // Request memory read permission
  const requestMemoryReadPermission = async () => {
    try {
      const granted = await request({
        type: 'memory',
        access: ['read'],
        scope: 'project',
        purpose: 'Access your project data for enhanced functionality',
        duration: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      setHasMemoryReadPermission(granted);
      
      if (!granted) {
        console.log('User denied memory read permission');
      }
    } catch (error) {
      console.error('Error requesting memory read permission:', error);
    }
  };
  
  // Request memory write permission
  const requestMemoryWritePermission = async () => {
    try {
      const granted = await request({
        type: 'memory',
        access: ['write'],
        scope: 'project',
        purpose: 'Save your project data for future sessions',
        duration: 24 * 60 * 60 * 1000 // 1 day
      });
      
      setHasMemoryWritePermission(granted);
      
      if (!granted) {
        console.log('User denied memory write permission');
      }
    } catch (error) {
      console.error('Error requesting memory write permission:', error);
    }
  };
  
  // Request user profile permission
  const requestUserProfilePermission = async () => {
    try {
      const granted = await request({
        type: 'user',
        access: ['profile'],
        scope: 'read',
        purpose: 'Access your profile information to personalize your experience',
        duration: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      setHasUserProfilePermission(granted);
      
      if (!granted) {
        console.log('User denied profile permission');
      }
    } catch (error) {
      console.error('Error requesting profile permission:', error);
    }
  };
  
  // Request all permissions at once
  const requestAllPermissions = async () => {
    try {
      const results = await requestAll([
        {
          type: 'memory',
          access: ['read', 'write'],
          scope: 'project',
          purpose: 'Access and save your project data'
        },
        {
          type: 'user',
          access: ['profile'],
          scope: 'read',
          purpose: 'Access your profile information'
        }
      ]);
      
      setHasMemoryReadPermission(!!results['memory.read.project']);
      setHasMemoryWritePermission(!!results['memory.write.project']);
      setHasUserProfilePermission(!!results['user.profile.read']);
    } catch (error) {
      console.error('Error requesting all permissions:', error);
    }
  };
  
  // Revoke memory permissions
  const revokeMemoryPermissions = async () => {
    try {
      if (hasMemoryReadPermission) {
        await revoke('memory.read.project');
        setHasMemoryReadPermission(false);
      }
      
      if (hasMemoryWritePermission) {
        await revoke('memory.write.project');
        setHasMemoryWritePermission(false);
      }
    } catch (error) {
      console.error('Error revoking permissions:', error);
    }
  };
  
  // Revoke user profile permission
  const revokeProfilePermission = async () => {
    try {
      if (hasUserProfilePermission) {
        await revoke('user.profile.read');
        setHasUserProfilePermission(false);
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
    }
  };
  
  if (isCheckingPermissions) {
    return <div>Checking permissions...</div>;
  }
  
  return (
    <div className="permission-example">
      <h2>Permission System Example</h2>
      
      <section className="permission-section">
        <h3>Current Permission Status</h3>
        
        <div className="permission-status">
          <div className={`status-item ${hasMemoryReadPermission ? 'granted' : 'denied'}`}>
            <span className="status-icon">{hasMemoryReadPermission ? '✅' : '❌'}</span>
            <span className="status-name">Memory Read</span>
          </div>
          
          <div className={`status-item ${hasMemoryWritePermission ? 'granted' : 'denied'}`}>
            <span className="status-icon">{hasMemoryWritePermission ? '✅' : '❌'}</span>
            <span className="status-name">Memory Write</span>
          </div>
          
          <div className={`status-item ${hasUserProfilePermission ? 'granted' : 'denied'}`}>
            <span className="status-icon">{hasUserProfilePermission ? '✅' : '❌'}</span>
            <span className="status-name">User Profile</span>
          </div>
        </div>
      </section>
      
      <section className="permission-section">
        <h3>Request Individual Permissions</h3>
        <p>Request specific permissions with custom durations and purposes.</p>
        
        <div className="permission-actions">
          <button 
            onClick={requestMemoryReadPermission} 
            disabled={hasMemoryReadPermission}
          >
            Request Memory Read
          </button>
          
          <button 
            onClick={requestMemoryWritePermission} 
            disabled={hasMemoryWritePermission}
          >
            Request Memory Write
          </button>
          
          <button 
            onClick={requestUserProfilePermission} 
            disabled={hasUserProfilePermission}
          >
            Request User Profile
          </button>
        </div>
      </section>
      
      <section className="permission-section">
        <h3>Request All Permissions</h3>
        <p>Request multiple permissions in a single dialog.</p>
        
        <button 
          onClick={requestAllPermissions}
          disabled={hasMemoryReadPermission && hasMemoryWritePermission && hasUserProfilePermission}
        >
          Request All Permissions
        </button>
      </section>
      
      <section className="permission-section">
        <h3>Revoke Permissions</h3>
        <p>Programmatically revoke previously granted permissions.</p>
        
        <div className="permission-actions">
          <button 
            onClick={revokeMemoryPermissions}
            disabled={!hasMemoryReadPermission && !hasMemoryWritePermission}
          >
            Revoke Memory Permissions
          </button>
          
          <button 
            onClick={revokeProfilePermission}
            disabled={!hasUserProfilePermission}
          >
            Revoke Profile Permission
          </button>
        </div>
      </section>
    </div>
  );
}; 